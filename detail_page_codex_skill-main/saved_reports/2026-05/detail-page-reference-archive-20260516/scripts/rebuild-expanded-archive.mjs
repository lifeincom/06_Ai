#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve("saved_reports/2026-05/detail-page-reference-archive-20260516");
const sourcesDir = path.join(root, "sources");

const meta = {
  "cojooboo-paid-ed6f453f": {
    site: "Cojooboo",
    title: "통장 건강 챙기는 리스크 제로 AI 건기식",
    type: "유료 고가 강의형",
    note: "일정, 커리큘럼, 혜택, 가격 방어, 증거를 길게 쌓는 결제 전환 구조",
  },
  "cojooboo-free-7750aa4d": {
    site: "Cojooboo",
    title: "농산물 위탁판매로 온라인 월세 벌기",
    type: "무료강의 신청형",
    note: "무료 라이브 신청과 리드 확보를 위한 2장 압축형 구조",
  },
  "invader-64ceff0c": {
    site: "Invader",
    title: "생필품 판매로 월 순익 2,000만원",
    type: "유료 고가 강의형",
    note: "친숙한 생필품 시장을 월수익/위탁판매/혜택으로 묶는 구조",
  },
  "invader-784c290e": {
    site: "Invader",
    title: "K-뷰티 내 화장품 브랜드 클래스",
    type: "유료 고가 강의형",
    note: "K-뷰티와 내 브랜드 욕망을 해외 수요, 브랜드 창업으로 포장",
  },
  "invader-6b4c9df0": {
    site: "Invader",
    title: "크록스 판매로 월 5000 구조",
    type: "시즌성 상품 고가 강의형",
    note: "계절성, 단일 상품, 큰 수익 약속으로 즉시성을 강하게 만드는 구조",
  },
  "nlab-free-f9a50d60": {
    site: "NLAB",
    title: "초간단 AI 플레이리스트 월 100만원 프로젝트",
    type: "무료강의/사이드잡 신청형",
    note: "AI, 하루 20분, 월 100만원처럼 낮은 진입장벽과 작은 결과를 결합",
  },
  "nlab-free-bc0e166f": {
    site: "NLAB",
    title: "쿠팡 건강식품 월 2억 노하우",
    type: "무료강의 신청형",
    note: "쿠팡/건강식품/매출 사례를 한 장 중심으로 압축한 리드 확보형",
  },
  "nlab-course-e972ff47": {
    site: "NLAB",
    title: "로켓그로스 완벽가이드",
    type: "유료 강의형",
    note: "재결제형 강의로 보이며 상세 이미지는 짧게 구성됨",
  },
  "titanclass-176064": {
    site: "Titanclass",
    title: "타이탄클래스 VOD 강의 후보",
    type: "VOD 강의형",
    note: "사이트맵 접근 제한이 있어 검색 노출 상세 URL에서 썸네일 중심으로 제한 수집",
  },
  "richfriends-212528": {
    site: "Richfriends Liveklass",
    title: "법무사 비용 비교 계산기",
    type: "무료/도구형 클래스",
    note: "Liveklass 모듈형 상세페이지. 커리큘럼/평점/추천 클래스 UI까지 같이 수집됨",
  },
  "richfriends-201803": {
    site: "Richfriends Liveklass",
    title: "소액 투자의 종말",
    type: "부동산/투자 VOD 클래스",
    note: "부동산 리스크/제도 변화 공포를 앞세운 콘텐츠형 상세페이지",
  },
  "fitchnic-2ec1795b": {
    site: "Fitchnic",
    title: "매달 300 자동 연금 시스템 무료강의",
    type: "무료강의 신청형",
    note: "headless 차단이 있어 브라우저 UA로 제한 수집. 썸네일/대표 이미지 중심",
  },
  "millmus-detail-33": {
    site: "Millmus",
    title: "포리얼·아로스·페코",
    type: "전문가 묶음 강의형",
    note: "여러 튜터/브랜드 신뢰를 묶어 보여주는 강의 상세 구조",
  },
  "millmus-premium-1": {
    site: "Millmus",
    title: "프리미엄 스터디 클래스",
    type: "프리미엄 멤버십/스터디형",
    note: "멤버십/스터디/프리미엄 포지셔닝을 전면에 두는 구조",
  },
};

const failures = [
  {
    site: "Buchinclass",
    url: "https://www.buchinclass.com/",
    status: "제한 수집",
    reason: "홈/사이트맵/검색 후보 상세 경로가 Next 404로 응답. 직접 상세 URL을 찾지 못함.",
  },
  {
    site: "Buchin Fifteenh",
    url: "https://buchin.fifteenh.io/",
    status: "수집 실패",
    reason: "홈과 sitemap.xml이 404 페이지로 응답하고 상세 강의 링크가 노출되지 않음.",
  },
  {
    site: "Titanclass",
    url: "https://www.titanclass.co.kr/sitemap.xml",
    status: "부분 수집",
    reason: "sitemap은 보안/제한 페이지로 응답. 검색 노출 상세 URL 1개만 제한 수집.",
  },
  {
    site: "Fitchnic",
    url: "https://www.fitchnic.com/courses/9c122804-3c6a-4928-bcd1-f676d40115c6",
    status: "일부 후보 실패",
    reason: "후보 상세 URL 중 일부는 렌더링 DOM에서 상세 이미지 URL을 찾지 못함.",
  },
];

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function md(value) {
  return String(value ?? "").replaceAll("|", "\\|");
}

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

async function titleFromDom(dir) {
  const domPath = path.join(dir, "source-dom.html");
  if (!(await exists(domPath))) return "";
  const dom = await fs.readFile(domPath, "utf8");
  const title = dom.match(/<title>([^<]+)<\/title>/)?.[1];
  return title ? title.trim() : "";
}

async function main() {
  const entries = [];
  const dirs = (await fs.readdir(sourcesDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const id of dirs) {
    const dir = path.join(sourcesDir, id);
    const manifestPath = path.join(dir, "manifest.json");
    if (!(await exists(manifestPath))) continue;
    const manifest = await readJson(manifestPath);
    const itemMeta = meta[id] ?? {};
    const fallbackTitle = await titleFromDom(dir);
    const files = manifest.files ?? [];
    entries.push({
      id,
      site: itemMeta.site ?? new URL(manifest.sourceUrl).hostname,
      title: itemMeta.title ?? fallbackTitle ?? id,
      type: itemMeta.type ?? "강의 상세페이지",
      note: itemMeta.note ?? "",
      sourceUrl: manifest.sourceUrl,
      detailImageCount: manifest.detailImageCount ?? files.filter((file) => file.role === "detail").length,
      fileCount: files.length,
      manifest: `sources/${id}/manifest.json`,
      index: `sources/${id}/index.html`,
      contactSheet: (await exists(path.join(dir, "analysis/contact-sheet.jpg"))) ? `sources/${id}/analysis/contact-sheet.jpg` : null,
    });
  }

  const bySite = new Map();
  for (const entry of entries) {
    if (!bySite.has(entry.site)) bySite.set(entry.site, []);
    bySite.get(entry.site).push(entry);
  }

  const totalDetail = entries.reduce((sum, entry) => sum + entry.detailImageCount, 0);
  const totalFiles = entries.reduce((sum, entry) => sum + entry.fileCount, 0);

  const archiveManifest = {
    createdAtKst: "2026-05-16",
    title: "대표 강의 상세페이지 레퍼런스 확장 아카이브",
    scope: "사용자가 지정한 9개 사이트의 대표 강의 상세페이지 후보 수집 및 분석",
    sourceCount: entries.length,
    totalDetailImages: totalDetail,
    totalFiles,
    sources: entries,
    failures,
  };
  await fs.writeFile(path.join(root, "archive-manifest.json"), JSON.stringify(archiveManifest, null, 2), "utf8");

  const report = `# 대표 강의 상세페이지 레퍼런스 확장 아카이브

생성일: 2026-05-16 KST  
용도: 프라이빗 상세페이지 스킬의 강의/무료강의/고가 클래스 상세페이지 참고 자료  
보관 범위: 사용자가 지정한 9개 사이트의 대표 강의 상세페이지 후보

## 수집 요약

- 수집 성공 상세페이지: ${entries.length}개
- 수집 이미지: 상세/후보 ${totalDetail}개, 전체 파일 ${totalFiles}개
- 접근 제한 또는 후보 미확정: ${failures.length}건
- 저장 위치: \`saved_reports/2026-05/detail-page-reference-archive-20260516/\`

## 사이트별 수집 현황

| 사이트 | 수집 상세페이지 | 수집 상태 |
|---|---:|---|
${[...bySite.entries()].map(([site, items]) => `| ${md(site)} | ${items.length} | 성공 |`).join("\n")}
${failures.map((failure) => `| ${md(failure.site)} | 0 | ${md(failure.status)} |`).join("\n")}

## 수집 상세

| ID | 사이트 | 페이지 | 이미지 | 포맷 분류 | 핵심 메모 |
|---|---|---|---:|---|---|
${entries.map((entry) => `| \`${entry.id}\` | ${md(entry.site)} | [${md(entry.title)}](${entry.sourceUrl}) | ${entry.detailImageCount} | ${md(entry.type)} | ${md(entry.note)} |`).join("\n")}

## 접근 제한/부분 수집

| 사이트 | URL | 상태 | 이유 |
|---|---|---|---|
${failures.map((failure) => `| ${md(failure.site)} | ${md(failure.url)} | ${md(failure.status)} | ${md(failure.reason)} |`).join("\n")}

## 패턴 분석

### 1. 이미지가 풍부한 고가 클래스형

Cojooboo, Invader, NLAB 일부 페이지는 상세 이미지 자체가 길게 구성된다. 제작 참고 우선순위가 높다. 공통 흐름은 \`결과 약속 -> 마감/혜택 -> 일정/커리큘럼 -> 시장 논리 -> 불안 제거 -> 증거/강사 -> CTA\`다.

### 2. 무료강의/리드 신청형

Cojooboo 무료강의, NLAB 무료강의, Fitchnic은 구매보다 신청 장벽을 낮추는 방향이다. 무료 보상, 날짜, 쉬운 시작, 작지만 구체적인 수익 약속을 앞에 둔다.

### 3. 플랫폼 모듈형 상세페이지

Richfriends Liveklass, Millmus, Titanclass는 긴 이미지보다 플랫폼 UI, 썸네일, 커리큘럼 모듈, 추천 강의 영역에 기대는 비중이 크다. 이미지 컷을 그대로 복제하기보다 \`상세페이지 정보 설계\` 참고용으로 보는 게 맞다.

### 4. 시즌성/단일 아이템 수익형

Invader 크록스 페이지처럼 단일 상품, 계절성, 빠른 결과를 묶는 페이지는 긴 교육 가치보다 \`지금 이 타이밍\`을 강하게 만든다. AI 강의에도 특정 업무/툴/시즌 이벤트와 연결하면 쓸 수 있다.

## 제작에 반영할 기준

1. 한 컷은 큰 제목 1개, 보조문구 1개, 핵심 포인트 최대 3개로 제한한다.
2. 글이 많아질 때는 한 장에 몰지 말고 컷을 늘린다.
3. 유료 강의는 초반에 가격만 밀지 말고 일정, 커리큘럼, 혜택, 증거를 먼저 쌓는다.
4. 무료강의는 신청 CTA를 자주 반복해도 괜찮지만, 신청 이유는 첫 화면에서 끝내야 한다.
5. 레퍼런스의 원본 인물, 성과 인증, 카피, 브랜드 이미지는 복제하지 않고 구조만 가져온다.

## 프라이빗 상세페이지 키워드

- 고가 강의형
- 무료강의 신청형
- AI 부업 강의형
- 시즌성 상품 수익형
- 부동산/투자 VOD형
- 플랫폼 모듈형 강의 상세페이지
- 커리큘럼 증거형
- 마감/혜택 압박형
- 초보자 불안 제거형
`;
  await fs.writeFile(path.join(root, "reference-archive-report.md"), report, "utf8");

  const cards = entries.map((entry) => `
    <article class="card">
      <div class="meta">${esc(entry.site)} · ${esc(entry.type)} · 이미지 ${entry.detailImageCount}</div>
      <h2>${esc(entry.title)}</h2>
      <p>${esc(entry.note)}</p>
      ${entry.contactSheet ? `<a class="sheet" href="${esc(entry.contactSheet)}"><img src="${esc(entry.contactSheet)}" alt="${esc(entry.title)} contact sheet"></a>` : ""}
      <div class="links">
        <a href="${esc(entry.index)}">수집본 보기</a>
        <a href="${esc(entry.manifest)}">manifest</a>
        <a href="${esc(entry.sourceUrl)}">원본 URL</a>
      </div>
    </article>`).join("\n");

  const failureRows = failures.map((failure) => `
    <tr><td>${esc(failure.site)}</td><td><a href="${esc(failure.url)}">${esc(failure.url)}</a></td><td>${esc(failure.status)}</td><td>${esc(failure.reason)}</td></tr>`).join("\n");

  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>대표 강의 상세페이지 레퍼런스 확장 아카이브</title>
  <style>
    :root{color-scheme:light;--bg:#f6f8fb;--ink:#111827;--muted:#6b7280;--line:#e5e7eb;--blue:#2563eb}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Pretendard",sans-serif}
    header{background:#fff;border-bottom:1px solid var(--line);padding:28px 18px}
    main{max-width:1180px;margin:0 auto;padding:24px 16px 72px}.wrap{max-width:1180px;margin:0 auto}
    h1{margin:0 0 8px;font-size:28px;letter-spacing:0}h2{margin:8px 0 8px;font-size:18px;letter-spacing:0}h3{font-size:18px}
    p{line-height:1.65}.summary{color:var(--muted);font-size:14px}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:18px}
    .stat{background:#f9fafb;border:1px solid var(--line);border-radius:8px;padding:14px}.stat b{display:block;font-size:22px}.stat span{color:var(--muted);font-size:13px}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px;overflow:hidden}
    .meta{font-size:12px;color:var(--muted);font-weight:700}.card p{font-size:14px;color:#374151}.sheet{display:block;margin:12px 0;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:#fff}
    .sheet img{display:block;width:100%;height:260px;object-fit:cover;object-position:top}.links{display:flex;gap:10px;flex-wrap:wrap}
    a{color:var(--blue);font-weight:700;text-decoration:none}.links a{font-size:13px}
    table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:8px;overflow:hidden}th,td{border-bottom:1px solid var(--line);padding:10px;text-align:left;font-size:13px;vertical-align:top}th{background:#f9fafb}
    section{margin-top:28px}.note{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px}
    @media(max-width:760px){.stats,.grid{grid-template-columns:1fr}h1{font-size:23px}.sheet img{height:220px}}
  </style>
</head>
<body>
  <header>
    <div class="wrap">
      <h1>대표 강의 상세페이지 레퍼런스 확장 아카이브</h1>
      <div class="summary">2026-05-16 KST · 9개 사이트 대표 강의 후보 수집 · 프라이빗 상세페이지 제작 참고용</div>
      <div class="stats">
        <div class="stat"><b>${entries.length}</b><span>수집 성공 상세페이지</span></div>
        <div class="stat"><b>${totalDetail}</b><span>상세/후보 이미지</span></div>
        <div class="stat"><b>${totalFiles}</b><span>전체 저장 파일</span></div>
        <div class="stat"><b>${failures.length}</b><span>접근 제한 기록</span></div>
      </div>
    </div>
  </header>
  <main>
    <section class="grid">${cards}</section>
    <section>
      <h3>접근 제한/부분 수집</h3>
      <table><thead><tr><th>사이트</th><th>URL</th><th>상태</th><th>이유</th></tr></thead><tbody>${failureRows}</tbody></table>
    </section>
    <section class="note">
      <h3>제작 반영 기준</h3>
      <p>글자 수는 줄이고 컷 수를 늘린다. 한 컷에는 큰 제목 1개, 보조문구 1개, 포인트 최대 3개만 둔다. 유료 강의는 일정/커리큘럼/혜택/증거를 먼저 쌓고, 무료강의는 신청 이유와 날짜를 첫 화면에서 끝낸다.</p>
      <p><a href="reference-archive-report.md">분석 리포트 보기</a> · <a href="archive-manifest.json">전체 manifest 보기</a></p>
    </section>
  </main>
</body>
</html>`;
  await fs.writeFile(path.join(root, "index.html"), html, "utf8");
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
