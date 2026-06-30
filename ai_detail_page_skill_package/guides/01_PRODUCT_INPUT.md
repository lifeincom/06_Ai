# 01. 상품정보 입력 지침

## 목적

상세페이지 제작에 필요한 상품 정보를 문답형으로 수집하고 구조화한다.

## 질문 순서

```text
1. 상품명은 무엇인가?
2. 브랜드명은 무엇인가?
3. 상품 카테고리는 무엇인가?
4. 핵심 장점 3~5개는 무엇인가?
5. 타깃 고객은 누구인가?
6. 소재, 원재료, 스펙, 사이즈 정보는 무엇인가?
7. 원산지 또는 제조 정보가 있는가?
8. 원하는 상세페이지 분위기는 무엇인가?
9. 실제 상품 이미지는 있는가?
10. 참고 URL이나 경쟁 브랜드가 있는가?
```

## 필수 항목

| 필드 | 설명 |
|---|---|
| product_name | 상품명 |
| brand_name | 브랜드명 |
| category | 상품 카테고리 |
| target_customer | 타깃 고객 |
| main_features | 핵심 장점 |
| product_images | 상품 이미지 유무 |
| preferred_style | 디자인 분위기 |

## 출력 형식

```json
{
  "product_name": "",
  "brand_name": "",
  "category": "",
  "price_range": "",
  "target_customer": "",
  "main_features": [],
  "materials": "",
  "size_info": "",
  "origin": "",
  "selling_point": "",
  "product_images": [],
  "preferred_style": "",
  "reference_urls": []
}
```

## 완료 기준

아래 항목이 채워지면 다음 단계로 이동한다.

- 상품명
- 브랜드명
- 카테고리
- 핵심 장점
- 상품 이미지 유무
- 원하는 분위기
