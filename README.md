# 원소 주기율표

AppsInToss Factory에서 관리하는 교육형 원소 탐색 WebView 앱입니다.

## 개발

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## QA

```bash
npm run validate-spec -- --spec specs/periodic-table.json
npm run check-target -- --app periodic-table
npm run ci:target -- --app periodic-table
```

## 데이터

- 원자량, 표준 상태, 전자배치, 전기음성도, 밀도, 발견 연도: PubChem Periodic Table CSV
- 한국어 원소명: 기존 Flutter 앱의 `assets/i18n/ko/elements.json`
- 기존 `dangerousness` 값은 검증 기준이 없어 MVP UI에서 제외합니다.
