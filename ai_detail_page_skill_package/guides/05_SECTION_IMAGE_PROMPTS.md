# 05. 섹션별 이미지 프롬프트 작성 지침

## 목적

각 섹션을 860×1200 기준의 독립 이미지로 생성하기 위한 프롬프트를 작성한다.

## 기본 원칙

1. 한 장짜리 긴 상세페이지로 바로 만들지 않는다.
2. 섹션별로 독립 이미지를 생성한다.
3. 모든 섹션은 세로 연결이 가능해야 한다.
4. 한글 텍스트가 깨질 수 있으므로 Figma/Canva 후편집을 전제로 한다.
5. 상품 이미지가 없으면 가짜 패키지를 만들지 않는다.

## 기본 섹션

```text
section_01_hero
section_02_problem
section_03_benefit
section_04_usage
section_05_detail
section_06_spec
section_07_guide
section_08_closing
```

## 섹션별 역할

| 섹션 | 이미지 방향 |
|---|---|
| Hero | 상품 첫인상, 원물/제품 이미지, 메인 카피 |
| Problem | 고객 고민, 문제 제기, 공감형 이미지 |
| Benefit | 핵심 장점 3~4개 카드형 |
| Usage | 활용 장면, 라이프스타일 컷 |
| Detail | 원물/소재/디테일 클로즈업 |
| Spec | 스펙표, 용량, 원산지, 보관 정보 |
| Guide | 사용법, 보관법, 관리법 |
| Closing | 브랜드 신뢰, 구매 설득 마무리 |

## 공통 프롬프트 구조

```text
Create one independent section image for a Korean ecommerce product detail page.

Canvas:
- Width: 860px
- Height: 1200px
- Single section only
- Vertically connectable with other sections
- Clean Korean online shopping mall style

Product:
- Product name: [상품명]
- Brand: [브랜드명]
- Category: [카테고리]
- Main features: [핵심 장점]

Section:
- Section ID: [section_id]
- Section name: [section_name]
- Goal: [goal]

Copy:
- Headline: [headline]
- Subheadline: [subheadline]
- Body copy: [body_copy]

Design system:
- Background: [background_color]
- Primary color: [primary_color]
- Secondary color: [secondary_color]
- Accent color: [accent_color]
- Font style: Pretendard-like Korean sans-serif
- Style: [preferred_style]

Rules:
- Use short Korean copy only.
- Keep text areas clean and readable.
- If text rendering is unreliable, leave clean space for Figma/Canva text overlay.
- Do not use fake logo.
- Do not use fake package if product photo is not provided.
- Make it look like a real Korean ecommerce detail page section.

Negative prompt:
no fake package, no fake logo, no unreadable Korean, no broken letters, no random text, no watermark, no messy layout, no distorted product, no false certification mark
```

## 완료 기준

각 섹션마다 아래 항목이 있어야 한다.

- section_id
- headline
- subheadline
- body_copy
- visual_direction
- layout_direction
- image_prompt
- negative_prompt
