# History

## 2026-05-13

- Strengthened `ecommerce-detail-page` image-production rules so final cut images must use maximum available parallel agents by default.
- Clarified the coordinator/worker pattern: the main agent splits approved cuts, launches all possible cut workers before waiting, keeps ownership scoped to `cut-01` through `cut-N`, collects outputs, regenerates only failed cuts, and builds the final gallery after all cuts finish.

## 2026-05-12

- Built an `ecommerce-detail-page` Codex skill from the downloaded Korean ecommerce detail-page image guideline.
- Added a concise `SKILL.md` plus progressive reference files for category checks, cut structure, copy/compliance rules, and the final output template.
- Added `agents/openai.yaml` so the skill has UI-facing metadata and a default prompt.
- Updated the skill trigger description so Korean requests such as `상세페이지 만들고 싶다`, `상세페이지 만들어줘`, and `상세페이지 제작` invoke the skill.
- Improved the intake workflow so questions are choice-based, product-name-only requests can proceed with recommended assumptions, and actual image production must follow the completed detail-page plan.
- Revised the intake workflow to ask exactly one question at a time, always with visible choices, and to wait for the user's answer before moving to the next unresolved question.
- Updated the intake channel guidance to prefer Codex's internal choice UI when available, with text A/B/C choices as the fallback.
- Verified the live intake flow through a sample detail-page setup: mode B, beauty category, lipstick product, and Coupang channel, continuing one question at a time.
- Updated the intake logic so product name or category triggers target/customer research or inference, recommended customer choices are marked with `(추천)`, and sales channel is optional unless channel-specific constraints are needed.
- Continued a live sample run after the updated intake logic: product `립스틱`, inferred beauty/cosmetics category, target `데일리 메이크업용 립을 찾는 20~30대 여성`, and selected `6컷 간단형`.
- Tightened the image workflow after a failed generation: product photos must be checked first, planning outputs use ASCII wireframes instead of image prompts, image generation requires an explicit generate-or-revise question, selected cut counts must be exact, and image production must create one separate image per planned cut.
- Fixed remaining cut-count drift by changing the default from `8~12` to exactly `12` cuts, making the product-photo question the first intake question, and updating `cut-structure.md` with exact 12-cut and 15-cut rules.
- Ran the updated intake flow again for a lipstick detail page: no product photo, inferred beauty/cosmetics category, recommended target accepted, selected exact `6컷 간단형`, and required facts set to recommendation/confirmation-needed.
- Updated final image production requirements so generated cuts must be sales-ready Naver/Coupang-style detail-page images with approved Korean text rendered inside each image, while blank placeholders/text-safe mockups are only allowed for drafts or wireframes.
- Added explicit production QA fields and minimum sellable facts/photo requirements: final images must include approved Korean text, pass mobile readability and Hangul accuracy checks, avoid unverified claims, and use product photos/facts when available.
- Inspected local tooling for programmatic Korean-text PNG generation: Node/Bun are available, no repo-local image libraries are installed, macOS `sips`/`qlmanage` and Homebrew `ffmpeg` are available, and usable Korean fonts include Pretendard plus Apple SD Gothic Neo.
- Corrected the production workflow to use the image-generation model alone for final visual and Korean text rendering; failed Korean text should be handled by stricter regeneration prompts, not default text-overlay post-processing.
- Added selectable detail-page style templates based on marketplace research: Coupang practical information, Naver brand story, premium beauty, problem-solving infographic, lifestyle usage, gift/package, and review/trust styles.
- Started a new live detail-page intake using the latest skill flow: no product photo and product `립스틱`, with category inferred as beauty/cosmetics.
- Added parallel image-production guidance, Korean text QA, and an HTML review/download workflow with `references/image-production-workflow.md` plus `scripts/build-image-gallery.mjs`.
- Started image generation for the live lipstick detail page using image-generation-model-only Korean text rendering, 6 separate Coupang practical-style cuts.
- Applied the new workflow to the generated lipstick 6-cut set: copied ordered `cut-01` through `cut-06` files, built `generated/lipstick-coupang-practical/index.html`, added a ZIP download, and recorded `qa-report.md`.
- Improved the skill for provided product images: added `references/photo-analysis.md`, a product-photo analysis and placement recommendation section, and per-cut `사진 배치 추천` output.
- Added a weak-photo handling rule: if provided product images are not good enough for sales use, the skill must recommend using them as references for cleaner regenerated ecommerce visuals before final image production.
- Started a new house-plum detail-page task from `/Users/firstandre/Downloads/drive-download-20260513T022015Z-3-001`; inspected 11 source images and created `generated/house-plum/source-contact-sheet.jpg` for photo analysis.
- Generated the house-plum 12-cut detail-page image set under `generated/house-plum/cuts`, regenerated cut 03 after text QA, rebuilt `generated/house-plum/index.html`, and packaged `house-plum-12cuts.zip`.
- Tightened image-production instructions so approved detail-page cuts must be generated through simultaneous parallel agents/jobs by default, launching every cut before waiting for results.
- Created a recommended toothbrush detail-page brief at `generated/toothbrush-recommended/brief.md` using a 12-cut Coupang practical information style with missing product facts marked as confirmation needed.
- Generated the recommended toothbrush 12-cut sales-draft detail-page image set under `generated/toothbrush-recommended/cuts`, built `index.html`, packaged `toothbrush-recommended-12cuts.zip`, and recorded QA in `qa-report.md`.
- Added first-use guidance to `README.md` and `ecommerce-detail-page/SKILL.md`, including trigger phrases, recommended first inputs, default workflow, and minimal-input defaults.

## 2026-05-11

- Created the `Signal` pet concept from the user's known work style: practical, high-signal, evidence-focused, repo-aware, and execution-oriented.
- Generated the Hatch Pet run scaffold at `pet-runs/signal/`, including `pet_request.json`, `imagegen-jobs.json`, base prompt, row prompts, and layout guides.
- Added `signal-pet.md` as a durable project-local concept and generation prompt.
