# AI 상세페이지 제작 Skill

## Skill 이름

AI Detail Page Production Skill

## 목적

이 Skill은 쇼핑몰 상세페이지 제작 업무를 AI 문답형 워크플로우로 자동화하기 위해 사용한다.

사용자가 상품 정보를 입력하면 다음 순서로 작업한다.

1. 상품정보 정리
2. 웹 검색 기반 경쟁 상품 상세페이지 구조 및 카피 패턴 조사
3. 상세페이지 기획안 작성
4. 디자인 시스템 및 섹션별 레이아웃 설계
5. 섹션별 이미지 생성 프롬프트 작성
6. 섹션별 JSON 관리
7. 수정 요청 반영
8. 최종 상세페이지 초안 및 Figma/Canva 전송 구조 작성

## 핵심 원칙

### 1. 긴 상세페이지를 한 번에 만들지 않는다

상세페이지 이미지를 한 장으로 바로 생성하지 않는다.  
섹션별 이미지를 각각 생성하고, 최종적으로 연결한다.

이유:

- 한글 텍스트 깨짐 방지
- 섹션별 수정 용이
- Figma/Canva 후편집 용이
- 반복 제작 템플릿화 가능

### 2. 섹션별 JSON을 유지한다

각 섹션은 반드시 JSON으로 관리한다.

필수 필드:

- section_id
- section_name
- goal
- headline
- subheadline
- body_copy
- visual_direction
- layout_direction
- image_prompt
- negative_prompt
- image_file
- revision_notes
- status

### 3. 웹 리서치 문구는 그대로 복사하지 않는다

웹 리서치는 구조와 패턴 분석용이다.  
경쟁 상품의 카피, 상세페이지 문구, 리뷰 표현을 그대로 복사하지 않는다.

허용:

- 섹션 구조 참고
- 구매 포인트 분석
- 고객 니즈 분석
- 이미지 연출 방식 참고
- 카피 패턴 재해석

금지:

- 문구 그대로 복사
- 경쟁사 디자인 모방
- 브랜드명 무단 사용
- 허위 인증/로고/패키지 생성

### 4. 상품 이미지가 없으면 가짜 패키지를 만들지 않는다

상품 이미지가 없을 때는 다음 방식으로 제작한다.

- 원물 이미지
- 사용 장면
- 활용 요리
- 보관 방법
- 정보형 인포그래픽
- Figma/Canva 텍스트 후편집 공간

금지:

- 가짜 패키지
- 가짜 로고
- 가짜 인증 마크
- 실제 상품처럼 보이는 허위 이미지

## 작업 시작 조건

사용자가 아래와 같이 말하면 Skill을 시작한다.

```text
상세페이지 제작
상세페이지 자동 제작 시작
상품 상세페이지 만들어줘
AI 상세페이지 프로젝트 시작
```

## 첫 질문

항상 아래 정보를 먼저 질문한다.

```text
상품명:
브랜드명:
상품 카테고리:
핵심 장점 3~5개:
상품 이미지 있음/없음:
원하는 분위기: 실용형 / 프리미엄형 / 감성형 / 강한 판매형
최종 전송 도구: Figma / Canva
```

## 작업 단계

### Step 1. 상품정보 입력

참조 파일:

```text
guides/01_PRODUCT_INPUT.md
schemas/product_info.schema.json
```

결과물:

```text
outputs/product_info.json
```

### Step 2. 웹 리서치

참조 파일:

```text
guides/02_WEB_RESEARCH.md
```

결과물:

```text
outputs/research_summary.md
```

### Step 3. 상세페이지 기획

참조 파일:

```text
guides/03_PLANNING.md
```

결과물:

```text
outputs/planning.md
```

### Step 4. 디자인 시스템 설계

참조 파일:

```text
guides/04_DESIGN_SYSTEM.md
schemas/design_system.schema.json
```

결과물:

```text
outputs/design_system.json
```

### Step 5. 섹션별 이미지 프롬프트 작성

참조 파일:

```text
guides/05_SECTION_IMAGE_PROMPTS.md
templates/section_image_prompt.md
```

결과물:

```text
outputs/section_01_hero.md
outputs/section_02_problem.md
outputs/section_03_benefit.md
outputs/section_04_usage.md
outputs/section_05_detail.md
outputs/section_06_spec.md
outputs/section_07_guide.md
outputs/section_08_closing.md
```

### Step 6. JSON 관리

참조 파일:

```text
guides/06_JSON_MANAGEMENT.md
schemas/detail_page_project.schema.json
```

결과물:

```text
outputs/detail_page_project.json
```

### Step 7. 수정 반영

참조 파일:

```text
guides/07_REVISION.md
templates/revision_prompt.md
```

결과물:

```text
outputs/revision_history.json
```

### Step 8. 최종 Export

참조 파일:

```text
guides/08_FINAL_EXPORT.md
templates/figma_export_structure.md
templates/canva_export_structure.md
```

결과물:

```text
outputs/final_export_package.md
```

## 기본 섹션 구조

| 순서 | section_id | section_name | 역할 |
|---|---|---|---|
| 1 | section_01_hero | Hero | 첫인상과 메인 카피 |
| 2 | section_02_problem | Problem | 고객 문제 제기 |
| 3 | section_03_benefit | Benefit | 핵심 장점 |
| 4 | section_04_usage | Usage | 사용 장면 |
| 5 | section_05_detail | Detail | 디테일/원물/소재 |
| 6 | section_06_spec | Spec | 상품 정보 |
| 7 | section_07_guide | Guide | 사용법/보관법 |
| 8 | section_08_closing | Closing | 구매 설득 마무리 |

## 출력 스타일

- 단계별로 진행한다.
- 한 번에 모든 결과를 만들지 않는다.
- 각 단계 결과물을 명확한 파일명 기준으로 출력한다.
- 각 단계별로 사용자가 확인하고 승인한 후 다음 단계로 진행한다.
- 각 단계별로 사용자가 수정 요청을 하면 즉시 반영한다.
- 사용자가 중지하면 즉시 중지한다.
- 사용자가 이어서 진행하면 마지막 단계부터 이어간다.
