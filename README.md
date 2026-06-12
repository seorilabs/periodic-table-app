# 원소 주기율표

AppsInToss용 교육형 원소 탐색 WebView 앱입니다.

## 개발

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

## 검증

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## 데이터

- 원자량, 표준 상태, 전자배치, 전기음성도, 밀도, 발견 연도: PubChem Periodic Table CSV
- 한국어 원소명: 대한화학회 제정 원소 이름
- 기존 `dangerousness` 값은 검증 기준이 없어 MVP UI에서 제외합니다.

데이터와 이미지 출처는 [NOTICE.md](NOTICE.md)를 함께 확인합니다.

## 공개 저장소 운영

- 외부 pull request 검증은 GitHub-hosted runner에서 실행합니다.
- `main`/`develop` push와 AppsInToss 배포처럼 신뢰된 경로만 Seorilabs ARC self-hosted runner를 사용합니다.
- AppsInToss API key 등 운영 secret은 GitHub Secrets에만 둡니다.

## 라이선스

소스 코드는 [MIT License](LICENSE)로 배포합니다. 데이터와 타사 패키지는 각 출처와 라이선스 조건을 따릅니다.
