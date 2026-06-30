#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";

const execFileAsync = promisify(execFile);

const outputPath = process.argv[2];
if (!outputPath) {
  console.error("Usage: node scripts/discover-course-pages.mjs <output-json>");
  process.exit(1);
}

const sites = [
  "https://www.nlab.kr/",
  "https://www.invader.co.kr/",
  "https://www.titanclass.co.kr/",
  "https://www.cojooboo.co.kr/",
  "https://buchinclass.com/",
  "https://richfriends.liveklass.com/",
  "https://buchin.fifteenh.io/",
  "https://fitchnic.com/",
  "https://millmus.com/",
];

const chromeCandidates = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/opt/homebrew/bin/chromium",
  "/usr/bin/chromium",
];

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

function uniqBy(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function normalizeUrl(base, href) {
  try {
    return new URL(href, base).toString().split("#")[0];
  } catch {
    return null;
  }
}

function isCourseUrl(url) {
  return /\/(courses|free-courses|course|classes|class|products|lectures)\/[^/?#]+/i.test(url);
}

function extractTitleNear(dom, href) {
  const idx = dom.indexOf(href);
  if (idx < 0) return "";
  const slice = dom.slice(Math.max(0, idx - 600), Math.min(dom.length, idx + 1000));
  const text = slice
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 140);
}

function extractCourseLinks(baseUrl, dom) {
  const decoded = decodeHtml(dom);
  const links = [];

  for (const match of decoded.matchAll(/href=["']([^"']+)["']/g)) {
    const url = normalizeUrl(baseUrl, match[1]);
    if (!url || !isCourseUrl(url)) continue;
    links.push({ url, source: "anchor", titleHint: extractTitleNear(decoded, match[1]) });
  }

  for (const match of decoded.matchAll(/["']((?:https?:\/\/[^"']+)?\/(?:courses|free-courses|course|classes|class|products|lectures)\/[^"'<>\s]+)["']/gi)) {
    const url = normalizeUrl(baseUrl, match[1]);
    if (!url || !isCourseUrl(url)) continue;
    links.push({ url, source: "text", titleHint: extractTitleNear(decoded, match[1]) });
  }

  return uniqBy(links, (item) => item.url)
    .filter((item) => new URL(item.url).hostname.replace(/^www\./, "") === new URL(baseUrl).hostname.replace(/^www\./, ""))
    .slice(0, 20);
}

async function dumpDom(chrome, url, outDir) {
  const profileDir = await fs.mkdtemp(path.join(os.tmpdir(), "course-discovery-chrome-"));
  const safeName = url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 90);
  const domPath = path.join(outDir, `${safeName}.html`);
  try {
    const { stdout } = await execFileAsync(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        `--user-data-dir=${profileDir}`,
        "--dump-dom",
        url,
      ],
      { maxBuffer: 80 * 1024 * 1024, timeout: 25_000 }
    );
    await fs.writeFile(domPath, stdout, "utf8");
    return { ok: true, dom: stdout, domPath };
  } catch (error) {
    await fs.writeFile(domPath.replace(/\.html$/, ".error.txt"), String(error.stack || error.message), "utf8");
    return { ok: false, error: String(error.message || error), domPath: domPath.replace(/\.html$/, ".error.txt") };
  }
}

async function main() {
  const chrome = (await Promise.all(chromeCandidates.map(async (candidate) => ((await exists(candidate)) ? candidate : null)))).find(Boolean);
  if (!chrome) throw new Error("Chrome/Chromium not found.");

  const outputAbs = path.resolve(outputPath);
  const outDir = path.dirname(outputAbs);
  const domDir = path.join(outDir, "discovery-dom");
  await fs.mkdir(domDir, { recursive: true });

  const results = [];
  for (const site of sites) {
    const seedUrls = [site, new URL("/courses", site).toString()];
    const discovered = [];
    const attempts = [];
    for (const seed of seedUrls) {
      const dump = await dumpDom(chrome, seed, domDir);
      attempts.push({ seed, ok: dump.ok, domPath: path.relative(outDir, dump.domPath), error: dump.error || null });
      if (!dump.ok) continue;
      discovered.push(...extractCourseLinks(seed, dump.dom));
    }
    results.push({
      site,
      attempts,
      courses: uniqBy(discovered, (item) => item.url).slice(0, 8),
    });
  }

  await fs.writeFile(outputAbs, JSON.stringify({ createdAt: new Date().toISOString(), results }, null, 2), "utf8");
  console.log(outputAbs);
  for (const result of results) {
    console.log(`${result.site} -> ${result.courses.length} course URLs`);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
