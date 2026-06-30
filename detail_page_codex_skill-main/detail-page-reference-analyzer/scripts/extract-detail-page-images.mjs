#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";

const execFileAsync = promisify(execFile);

const url = process.argv[2];
const outputDir = process.argv[3] ? path.resolve(process.argv[3]) : null;

if (!url || !outputDir) {
  console.error("Usage: node scripts/extract-detail-page-images.mjs <url> <output-dir>");
  process.exit(1);
}

const chromeCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/opt/homebrew/bin/chromium",
  "/usr/bin/chromium",
];

const zipCandidates = ["/usr/bin/zip", "/opt/homebrew/bin/zip"];

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("\\u002F", "/")
    .replaceAll("\\/", "/")
    .replaceAll('\\"', '"');
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function extractUrls(dom) {
  const decoded = decodeHtml(dom);

  const detailBlock =
    decoded.match(/"detailImages":\[(.*?)\],"teachers"/s)?.[1] ||
    decoded.match(/detailImages\\":\[(.*?)\],\\"teachers/s)?.[1] ||
    "";

  const detailUrls = uniq(
    [...detailBlock.matchAll(/"imageUrl":"(https:\/\/[^"]+)"/g)].map((m) => m[1])
  );

  const thumbnail =
    decoded.match(/"thumbnail":"(https:\/\/[^"]+)"/)?.[1] ||
    decoded.match(/property=["']og:image["']\s+content=["']([^"']+)["']/)?.[1] ||
    decoded.match(/src="\/_next\/image\?url=([^"&]+).*?alt="Course Thumbnail"/)?.[1];

  const imageCandidates = [];

  for (const match of decoded.matchAll(/(?:src|content)=["']([^"']+)["']/g)) {
    imageCandidates.push(match[1]);
  }

  for (const match of decoded.matchAll(/srcset=["']([^"']+)["']/g)) {
    for (const part of match[1].split(",")) {
      imageCandidates.push(part.trim().split(/\s+/)[0]);
    }
  }

  for (const match of decoded.matchAll(/"imageUrl":"(https:\/\/[^"]+)"/g)) {
    imageCandidates.push(match[1]);
  }

  for (const match of decoded.matchAll(/"image":"(https:\/\/[^"]+)"/g)) {
    imageCandidates.push(match[1]);
  }

  for (const match of decoded.matchAll(/https?:\/\/[^"'<>)\s]+(?:png|jpe?g|webp|gif|avif)(?:\?[^"'<>)\s]+)?/gi)) {
    imageCandidates.push(match[0]);
  }

  for (const match of decoded.matchAll(/https?:\/\/[^"'<>)\s]+\/storage\/v1\/object\/public\/images\/[^"'<>)\s]+/gi)) {
    imageCandidates.push(match[0]);
  }

  for (const match of decoded.matchAll(/https?:\/\/utfs\.io\/f\/[^"'<>)\s\\]+/gi)) {
    imageCandidates.push(match[0]);
  }

  const normalizedCandidates = uniq(imageCandidates.map((candidate) => {
    const clean = decodeURIComponent(candidate).replace(/\.(png|jpe?g|webp|gif|avif)\.(?:jpe?g|png|webp|gif|avif)$/i, ".$1");
    const nextImage = clean.match(/^\/_next\/image\?url=([^&]+)/)?.[1] || clean.match(/\/_next\/image\?url=([^&]+)/)?.[1];
    return nextImage ? decodeURIComponent(nextImage) : clean;
  })).filter((candidate) => {
    if (!/^https?:\/\//.test(candidate)) return false;
    if (/\.(svg|ico)(\?|$)/i.test(candidate)) return false;
    if (/logo|favicon|avatar|icon|profile/i.test(candidate)) return false;
    return /\/storage\/v1\/object\/public\/images\//i.test(candidate) || /https?:\/\/utfs\.io\/f\//i.test(candidate) || /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(candidate);
  });

  return {
    thumbnail: thumbnail ? decodeURIComponent(thumbnail) : null,
    detailUrls: detailUrls.length ? detailUrls : normalizedCandidates,
    allImages: normalizedCandidates,
  };
}

function extensionFromUrl(imageUrl) {
  const clean = imageUrl.split("?")[0].toLowerCase();
  const ext = clean.match(/\.(png|jpe?g|webp|gif|avif)$/)?.[1] || "png";
  return ext === "jpeg" ? "jpg" : ext;
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function download(imageUrl, filePath) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Download failed ${response.status}: ${imageUrl}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  return buffer.length;
}

async function main() {
  const chrome = (await Promise.all(chromeCandidates.map(async (candidate) => ((await exists(candidate)) ? candidate : null)))).find(Boolean);
  if (!chrome) {
    throw new Error("Chrome/Chromium not found. Install Chrome or extract image URLs manually.");
  }

  await fs.mkdir(outputDir, { recursive: true });
  const imageDir = path.join(outputDir, "images");
  await fs.mkdir(imageDir, { recursive: true });

  const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), "detail-page-chrome-"));
  const { stdout } = await execFileAsync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      `--user-data-dir=${profileDir}`,
      "--dump-dom",
      url,
    ],
    { maxBuffer: 50 * 1024 * 1024, timeout: 60_000 }
  );

  await fs.writeFile(path.join(outputDir, "source-dom.html"), stdout, "utf8");

  const extracted = extractUrls(stdout);
  const detailUrls = extracted.detailUrls;
  if (!detailUrls.length) {
    throw new Error("No detail image URLs found in rendered DOM.");
  }

  const files = [];
  const failedDownloads = [];

  for (let i = 0; i < detailUrls.length; i += 1) {
    const imageUrl = detailUrls[i];
    const ext = extensionFromUrl(imageUrl);
    const filename = `detail-${String(i + 1).padStart(2, "0")}.${ext}`;
    try {
      const size = await download(imageUrl, path.join(imageDir, filename));
      files.push({ role: "detail", position: i + 1, file: filename, url: imageUrl, size });
    } catch (error) {
      failedDownloads.push({ role: "detail", position: i + 1, url: imageUrl, error: error.message });
    }
  }

  if (extracted.thumbnail && !detailUrls.includes(extracted.thumbnail)) {
    const ext = extensionFromUrl(extracted.thumbnail);
    const filename = `course-thumbnail.${ext}`;
    try {
      const size = await download(extracted.thumbnail, path.join(imageDir, filename));
      files.unshift({ role: "thumbnail", file: filename, url: extracted.thumbnail, size });
    } catch (error) {
      failedDownloads.push({ role: "thumbnail", url: extracted.thumbnail, error: error.message });
    }
  }

  if (!files.length) {
    throw new Error("Image URLs were found, but all downloads failed.");
  }

  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>상세페이지 참고 이미지 수집본</title>
  <style>
    body{margin:0;background:#f6f8fb;color:#111827;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Pretendard",sans-serif}
    header{position:sticky;top:0;background:rgba(255,255,255,.94);border-bottom:1px solid #e5e7eb;padding:16px 18px;backdrop-filter:blur(12px)}
    main,.wrap{max-width:980px;margin:0 auto} main{padding:20px 14px 64px}
    h1{margin:0 0 6px;font-size:20px}.meta{color:#6b7280;font-size:13px}
    article{background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:18px;box-shadow:0 8px 24px rgba(15,23,42,.05)}
    .bar{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 14px;border-bottom:1px solid #e5e7eb}
    h2{margin:0;font-size:15px}a{color:#3182f6;text-decoration:none;font-weight:700;font-size:13px}
    img{display:block;width:100%;height:auto;background:#fff}.thumbnail img{max-height:520px;object-fit:contain}
  </style>
</head>
<body>
  <header><div class="wrap"><h1>상세페이지 참고 이미지 수집본</h1><div class="meta">${esc(url)} · ${files.length} files</div></div></header>
  <main>
    ${files.map((item) => `<article class="${item.role === "thumbnail" ? "thumbnail" : ""}"><div class="bar"><h2>${esc(item.file)}</h2><a href="images/${esc(item.file)}" download>다운로드</a></div><img src="images/${esc(item.file)}" alt="${esc(item.file)}"></article>`).join("\n")}
  </main>
</body>
</html>`;

  const manifest = {
    sourceUrl: url,
    capturedAt: new Date().toISOString(),
    detailImageCount: files.filter((file) => file.role === "detail").length,
    files,
    failedDownloads,
  };

  await fs.writeFile(path.join(outputDir, "index.html"), html, "utf8");
  await fs.writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  const zip = (await Promise.all(zipCandidates.map(async (candidate) => ((await exists(candidate)) ? candidate : null)))).find(Boolean);
  if (zip) {
    const zipPath = path.join(outputDir, `${path.basename(path.resolve(outputDir))}.zip`);
    await execFileAsync(zip, ["-qr", zipPath, "images", "index.html", "manifest.json"], { cwd: outputDir });
    manifest.zipFile = path.basename(zipPath);
    await fs.writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  }

  console.log(path.resolve(outputDir));
  console.log(`detail images: ${manifest.detailImageCount}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
