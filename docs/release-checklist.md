# 출시 체크리스트

- [ ] 콘솔 앱 정보의 한국어 앱 이름이 `원소 주기율표`이고, `granite.config.ts`의 `brand.displayName`, `index.html`의 `<title>`이 모두 같은 값인지 확인
- [ ] 콘솔 앱 정보의 영어 앱 이름이 `Element Table`
- [ ] `periodic-table` appName 최종 확정. appName은 등록 후 수정할 수 없으므로 `intoss://periodic-table/` 진입까지 확인
- [ ] 콘솔 앱 로고 URL이 `https://static.toss.im/appsintoss/38345/045e816d-d16d-4ca8-839f-ebb99e97eb09.png`이고, `brand.icon`과 spec `app.iconUrl`도 같은 값인지 확인
- [ ] `webViewProps.type`이 `partner`인지 확인
- [ ] 비게임 앱 내 기능 `원소 찾기`, `원소 카드`, `원소 퀴즈`를 등록하고, 기능 URL `intoss://periodic-table/`, `intoss://periodic-table/elements`, `intoss://periodic-table/quiz`가 정상 접속되는지 확인
- [ ] 검토용 출시노트가 `docs/apps-in-toss-registration.md`와 Obsidian `프로젝트/periodic-table/최초 출시노트.md` 기준으로 제출됐는지 확인
- [ ] TDS Mobile 사용 확인
- [ ] 앱 로고 600 x 600 PNG, 투명 배경 없음
- [ ] 썸네일 1932 x 828 PNG
- [ ] 세로 스크린샷 636 x 1048 PNG 최소 3장
- [ ] 고객센터 전화번호 확정
- [ ] 로그인, 결제, 광고, 서버 저장, 권한을 사용하지 않는다는 점 확인
- [ ] `npm run lint` 통과
- [ ] `npm run typecheck` 통과
- [ ] `npm test` 통과
- [ ] `npm run build` 통과
