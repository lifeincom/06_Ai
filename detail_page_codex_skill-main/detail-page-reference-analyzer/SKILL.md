---
name: detail-page-reference-analyzer
description: Use when the user explicitly says "프라이빗 상세페이지" or "강의 상세페이지", wants to privately collect images from an existing ecommerce/course/detail-page URL, analyze competitor/reference detail page structure, reverse-plan Korean mobile 상세페이지 formats, classify pages such as "유료 고가 강의형", "무료강의 신청형", "전자책/자료 다운로드형", or "상품 판매형", or says phrases like "상세페이지 참고", "상세페이지 역기획", "이 사이트 이미지 가져와", "이건 하나의 형식이야", "이 이미지 파악해서 기획". If the user says "제작", "만들어줘", or "이미지까지 제작", produce actual detail-page images after planning, not only a plan. If the user only says a generic "상세페이지" keyword and the intent could mean either creating a new page or privately analyzing a reference page, ask whether to use this private analyzer before proceeding. This is a private personal reference-analysis and production skill for detail-page formats.
---

# Detail Page Reference Analyzer

## Required Response Branding

Every user-facing assistant response while this skill is active must begin with this exact line:

```text
[프라이빗 스킬]
```

## Purpose

Use this skill to turn an existing detail page, landing page, or saved image set into a reusable production strategy and, when requested, actual mobile detail-page images. It does not copy a competitor page. It extracts:

- downloadable image assets for private reference,
- the page's persuasive structure,
- format classification,
- cut-by-cut roles,
- a new planning template,
- final image cuts when the user says `제작`, `만들어줘`, or `이미지까지`.

## Invocation Routing

Use this skill immediately when the user says:

- `프라이빗 상세페이지`
- `강의 상세페이지`
- `상세페이지 참고`
- `상세페이지 역기획`
- `이 사이트 이미지 가져와`
- `이건 하나의 형식이야`
- `이 이미지 파악해서 기획`
- a detail-page URL plus a request to collect, analyze, classify, or make a reusable format

If the user says only a broad `상세페이지` keyword and the intent is ambiguous, ask one short routing question before doing work:

```text
[프라이빗 스킬]

이건 참고/URL 수집/역기획용 프라이빗 상세페이지 스킬로 진행할까요, 아니면 새 상세페이지 제작 스킬로 진행할까요?

A. 프라이빗 상세페이지 스킬로 참고 분석
B. 새 상세페이지 제작 스킬로 제작
```

If the user selects A or says `프라이빗 상세페이지`, continue with this skill. If the user selects B, hand off to `ecommerce-detail-page`. If the user says `강의 상세페이지 제작`, `프라이빗 상세페이지 제작`, `만들어줘`, or `이미지까지 제작`, stay in this skill and produce images after the plan.

## Quick Workflow

1. If the user provides a URL, try to collect images first.
   - Use `scripts/extract-detail-page-images.mjs` for Next/Vercel pages such as Cojooboo.
   - If static fetch is blocked, prefer Chrome headless DOM extraction over plain `curl`.
   - Save outputs under `generated/<slug>/images/`, with `manifest.json`, `index.html`, and a zip.
2. If the user provides local images or a previously collected folder, use that folder as the source.
3. Build a contact sheet when there are multiple long mobile images.
4. Classify the page format.
5. Produce a concise reverse-planning note with:
   - one-line diagnosis,
   - cut/section role table,
   - persuasion sequence,
   - reusable template,
   - compliance and originality cautions.
6. If the user asks for `제작`, generate the actual planned image cuts, build a local review gallery, and package the files.
7. If the user asks to improve the production skill, update the relevant skill files and installed copy together.

## Production Mode

When the user says `제작`, `만들어줘`, `하나 만들어봐`, `이미지까지`, or equivalent, do not stop at Markdown planning. The expected deliverable is actual image output.

Production steps:

1. Create or infer a cut plan for the selected format.
2. State any missing facts as `근거 필요` or `확인 필요`; do not invent revenue, reviews, certifications, dates, prices, or guarantees.
3. Generate the planned image cuts with Korean text rendered inside the image.
4. Save each cut under `generated/<slug>/images/` using names like `cut-01.png`.
5. Build a review `index.html` and a zip package.
6. Run a QA pass for readable Korean text, missing claims, visual consistency, and originality versus references.

Default cut counts when the user does not specify:

| Request type | Default image output |
|---|---|
| `강의 상세페이지 제작` / paid course | 10-12 mobile cuts |
| `무료강의 상세페이지 제작` / webinar | 4 long cuts or 6-8 shorter cuts |
| `전자책 상세페이지 제작` / free guide | 3 lead-capture cuts |
| `상품 상세페이지 제작` | 8-12 mobile cuts |

If the environment cannot generate images directly, produce the full cut plan and image prompts, then state clearly that image generation is blocked in the current environment.

## Format Classifier

Use the strongest matching type:

| Format | Signals | Recommended output |
|---|---|---|
| `유료 고가 강의형` | price, discount, curriculum, benefits stack, purchase button, refund policy | 10-12 cut paid conversion plan |
| `무료강의 신청형` | free, live date/time, apply button, marketing consent, lead capture | 2-4 long-image lead magnet plan |
| `전자책/자료 다운로드형` | PDF, ebook, free guide, download, email/Kakao capture | 1-3 lead capture images |
| `상품 판매형` | physical product, options, shipping, ingredients/specs, purchase quantity | 8-12 ecommerce product detail cuts |
| `브랜드/서비스 소개형` | service intro, testimonials, process, inquiry CTA | 6-10 service landing sections |

## Reverse Planning Output

Do not simply describe what is visible. Translate the page into production logic:

```text
포맷명:
한 줄 진단:

컷별 역할:
| 컷/구간 | 역할 | 핵심 메시지 | 제작 포인트 |

설득 구조:
1. ...

새로 만들 때 추천 구성:
| 컷 | 목적 | 권장 카피 방향 | 이미지 구성 |

주의사항:
- 원본 카피/이미지/인물/성과 인증을 그대로 복제하지 않음
- 매출/수익/후기/인증/가격/할인 숫자는 제공된 근거만 사용
```

## Known Reference Patterns

Read `references/reference-formats.md` when analyzing Korean course, webinar, lead magnet, or ecommerce detail pages.

## Image Collection Rules

- Store source URLs and filenames in `manifest.json`.
- Preserve original file extensions where possible, including GIF.
- Use names like `detail-01.png`, `detail-02.png`, and `course-thumbnail.png`.
- Build a local `index.html` review page for quick visual inspection.
- Zip the package when the collection succeeds.
- If the source blocks automation, say what failed and use browser-rendered DOM, screenshots, or manual URL extraction as fallback.

## Originality And Compliance

- Treat reference pages as structure examples only.
- Do not reuse a person's face, brand, proof screenshots, sales numbers, or exact phrases in final production unless the user owns them or explicitly provides permission.
- For claims about revenue, health, cosmetics, finance, education outcomes, discounts, reviews, certifications, or rankings, mark them as `근거 필요` unless verified or supplied by the user.
- For generated planning, keep the concept reusable and category-specific, not competitor-specific.
