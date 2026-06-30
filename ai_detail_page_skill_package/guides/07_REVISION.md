# 07. 수정 반영 지침

## 목적

생성된 섹션별 이미지 또는 문구를 section_id 기준으로 수정한다.

## 수정 요청 형식

```text
section_03_benefit 수정해줘.

수정 내용:
- 헤드라인을 더 강하게
- 핵심 장점 4개가 더 잘 보이게
- 배경을 더 깔끔하게
- 전체 디자인 시스템은 유지

JSON도 함께 업데이트해줘.
```

## 수정 가능 항목

| 항목 | 설명 |
|---|---|
| headline | 제목 |
| subheadline | 보조 문구 |
| body_copy | 본문 문구 |
| visual_direction | 이미지 방향 |
| layout_direction | 레이아웃 방향 |
| image_prompt | 이미지 생성 프롬프트 |
| negative_prompt | 제외 조건 |
| status | 진행 상태 |
| section_order | 섹션 순서 |

## 수정 시 유지 조건

- 가로 860px 기준
- 섹션 높이 1200px 기준
- 기존 디자인 시스템
- 상품 포지셔닝
- 브랜드 톤
- 전체 상세페이지 흐름

## 출력 형식

```markdown
# 수정 결과

## 수정 대상
section_03_benefit

## 기존 문제

## 수정 방향

## 변경된 카피

## 변경된 이미지 프롬프트

## 업데이트된 JSON

```json
{
}
```

## revision_history 추가 항목

```json
{
}
```
```

## 완료 기준

- 수정된 섹션 JSON 업데이트
- revision_history 추가
- 새 이미지 프롬프트 작성
- status 변경
