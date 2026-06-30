# 06. JSON 관리 지침

## 목적

상세페이지 프로젝트의 모든 작업 정보를 JSON으로 관리한다.

## 관리 대상

- 상품정보
- 웹 리서치 결과
- 기획안
- 디자인 시스템
- 섹션별 문구
- 섹션별 이미지 프롬프트
- 섹션별 이미지 파일명
- 수정 이력
- 최종 Export 상태

## 메인 JSON 구조

```json
{
  "project": {},
  "product_info": {},
  "research": {},
  "planning": {},
  "design_system": {},
  "sections": [],
  "revision_history": [],
  "export": {}
}
```

## 섹션 상태값

| status | 의미 |
|---|---|
| draft | 초안 |
| prompt_ready | 프롬프트 준비 완료 |
| generated | 이미지 생성 완료 |
| revision_requested | 수정 요청 있음 |
| revised | 수정 완료 |
| approved | 승인 |
| exported | 전송 완료 |

## 수정 이력 구조

```json
{
  "revision_id": "rev_001",
  "section_id": "section_03_benefit",
  "requested_at": "",
  "request": "",
  "changes": [],
  "status": "completed"
}
```

## 업데이트 규칙

1. 수정은 section_id 기준으로 처리한다.
2. 기존 내용을 삭제하지 말고 revision_notes에 기록한다.
3. 모든 수정은 revision_history에 추가한다.
4. 이미지가 새로 생성되면 image_file을 업데이트한다.
5. 승인된 섹션은 status를 approved로 변경한다.

## 완료 기준

- sections 8개 존재
- 모든 섹션의 프롬프트 존재
- revision_history 관리
- export 상태 관리
