# 로그 이벤트 지표 설계

## 이벤트 prefix

`periodic_table`

## 전환 지표

- `periodic_table_element_open`: 원소 카드 열기
- `periodic_table_search_submit`: 검색 실행
- `periodic_table_quiz_completed`: 퀴즈 완료

## 주요 파라미터

| 이벤트 | 파라미터 |
| --- | --- |
| `periodic_table_element_open` | `atomic_number`, `symbol`, `category`, `source` |
| `periodic_table_search_submit` | `query_type`, `result_count` |
| `periodic_table_quiz_completed` | `score`, `total` |
