# 04. 디자인 시스템 설계 지침

## 목적

섹션별 이미지와 최종 상세페이지가 일관된 톤으로 보이도록 디자인 기준을 확정한다.

## 기본 규격

| 항목 | 기준 |
|---|---|
| canvas_width | 860px |
| section_height | 1000px~1500px 권장 |
| section_type | 섹션별 독립 이미지 |
| final_output | 세로형 상세페이지 초안 |
| text_editing | Figma/Canva 후편집 권장 |

## 디자인 분위기 선택

### 실용형

- 화이트 배경
- 정보 중심
- 명확한 표와 아이콘
- 과장 없는 카피
- 신뢰감 중심

### 프리미엄형

- 넓은 여백
- 절제된 컬러
- 고급 사진 톤
- 짧은 카피
- 고급 식재료/브랜드 느낌

### 감성형

- 따뜻한 배경
- 라이프스타일 중심
- 자연광
- 부드러운 문장
- 사용 장면 강조

### 강한 판매형

- 장점/혜택 강조
- 대비 강한 타이포
- 아이콘/배지 사용
- 즉각적인 구매 이유 전달

## 출력 형식

```json
{
  "canvas_width": 860,
  "section_height": 1200,
  "font_style": "Pretendard-like Korean sans-serif",
  "background_color": "#FFFFFF",
  "primary_color": "#111111",
  "secondary_color": "#666666",
  "accent_color": "#2F6F5E",
  "sub_accent_color": "#F4EFE7",
  "layout_style": "clean Korean ecommerce detail page",
  "image_style": "realistic product photography",
  "spacing_rule": "wide margin, clear hierarchy",
  "typography_rule": {
    "headline": "large, bold, high readability",
    "subheadline": "medium, clear, persuasive",
    "body": "short, readable Korean copy"
  }
}
```

## 완료 기준

- 컬러
- 폰트 스타일
- 이미지 톤
- 섹션 크기
- 레이아웃 규칙
- 타이포그래피 계층
