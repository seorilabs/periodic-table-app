# AppsInToss 앱 등록 정보

## 기준

- 앱 성격: 비게임 교육형 미니앱
- 개발 방식: WebView, `@apps-in-toss/web-framework`
- 디자인 시스템: `@toss/tds-mobile`
- appName: `periodic-table`
- 표시명: `원소 주기율표`
- 앱 권한: 없음
- 현재 상태: `qa`

## 기본 정보

| 항목 | 입력값 |
| --- | --- |
| 한국어 앱 이름 | `원소 주기율표` |
| 영어 앱 이름 | `Element Table` |
| appName | `periodic-table` |
| 부제 | `원소를 빠르게 찾고 외우는 미니 표` |
| 앱 설명 | `원소 주기율표는 118개 원소를 작은 화면에서도 빠르게 탐색할 수 있게 정리한 교육형 미니앱입니다. 사용자는 앱에 들어오면 모바일 주기율표와 원소찾기 버튼을 보고, 원소 이름, 기호, 원자번호로 검색하거나 분류 칩을 눌러 원하는 원소를 고릅니다. 원소 카드를 열면 원자번호, 기호, 한국어/영어 이름, 원자량, 전자배치, 전기음성도, 밀도, 발견 연도와 짧은 설명을 확인할 수 있고, 퀴즈 풀기 버튼을 눌러 쉬움·보통·어려움 3단계 난이도의 복습 퀴즈로 기억을 점검할 수 있습니다. 퀴즈를 끝까지 풀면 1회 전면광고가 노출되고, 광고를 닫으면 점수와 헷갈린 원소 카드를 다시 볼 수 있습니다.` |
| 사용 연령 | `만 19세 이상` |
| 카테고리 후보 | `교육 / 화학`, `교육 / 학습 도구`, `생활 / 도구` |
| 검색 키워드 | `원소`, `주기율표`, `화학`, `원자번호`, `원소기호`, `퀴즈` |
| 고객센터 이메일 | `cs@seorilabs.com` |
| 고객센터 전화번호 | `확정 필요` |
| 채팅 상담 URL | `사용 안 함` |
| 운영 Origin | `https://periodic-table.apps.tossmini.com` |
| QR 테스트 Origin | `https://periodic-table.private-apps.tossmini.com` |

## 콘솔 고정값

| 항목 | 값 |
| --- | --- |
| 앱 유형 | 비게임 |
| WebView type | `partner` |
| 앱 권한 | 없음 |
| 로그인 | 사용 안 함 |
| 결제 | 사용 안 함 |
| 인앱 결제 | 사용 안 함 |
| 광고 | 사용, 전면형(quiz_result 1회 노출) |
| 공유 | 사용 안 함 |
| 서버 저장 | 사용 안 함 |
| 로컬 저장 | 사용, 최근 본 원소 1건 저장 |

## 출시 노트

### 검토용 출시노트

원소 주기율표는 118개 원소를 작은 화면에서도 빠르게 찾고, 원소 카드와 짧은 퀴즈로 복습할 수 있는 교육형 미니앱입니다.

주요 화면과 기능은 다음과 같습니다.

- 원소 찾기 화면: 모바일 주기율표, 원소찾기 버튼, 분류 필터를 제공해 원소 이름, 기호, 원자번호로 원하는 원소를 빠르게 찾을 수 있습니다.
- 원소 카드 화면: 선택한 원소의 원자번호, 기호, 한국어/영어 이름, 분류, 상태, 원자량, 전자배치, 전기음성도, 밀도, 발견 연도와 짧은 설명을 보여줍니다.
- 원소 퀴즈 화면: 퀴즈 풀기 버튼을 누르면 원자번호와 기호를 보고 원소 이름을 맞히는 5문항 복습 퀴즈를 진행합니다.
- 퀴즈 결과 화면: 정답 수를 확인하고, 틀린 원소가 있으면 해당 원소 카드를 다시 열어 복습할 수 있습니다.

이 서비스는 전문 화학 실험, 안전, 의료, 위험물 판단을 대신하지 않습니다. 로그인, 결제, 광고, 외부 링크, 개인정보 서버 저장 없이 원소 학습과 빠른 참고를 돕는 가벼운 교육 도구입니다.

## 앱 내 기능

| 한국어 기능 이름 | 영어 기능 이름 | 이동 경로 | 전체 URL | 진입 동작 |
| --- | --- | --- | --- | --- |
| `원소 찾기` | `Find Element` | `/` | `intoss://periodic-table/` | 주기율표와 검색 버튼이 있는 기본 탐색 화면으로 진입 |
| `원소 카드` | `Element Card` | `/elements` | `intoss://periodic-table/elements` | 기본 또는 최근 본 원소 카드 영역으로 진입 |
| `원소 퀴즈` | `Element Quiz` | `/quiz` | `intoss://periodic-table/quiz` | 5문항 퀴즈 첫 화면으로 바로 진입 |

### URL 연결 메모

- `/quiz`는 `src/App.tsx`에서 `window.location.pathname.includes("/quiz")` 조건으로 난이도 선택 화면(`mode: "quiz-difficulty"`)에 직접 연결된다. 사용자는 진입 후 쉬움/보통/어려움 중 하나를 골라야 실제 퀴즈가 시작된다.
- `/elements`는 원소 카드 영역으로 스크롤한다.
- 특정 원소 카드 검증에는 `intoss://periodic-table/elements?element=O`처럼 `element` 쿼리를 붙일 수 있다.
- 앱 내 기능명은 한국어 10자 이하, 영어 15자 이하 조건을 만족한다.

## 백버튼 네비게이션

`graniteEvent.backEvent`(v3 SDK)와 `window.popstate`(dev preview / 외부 브라우저)를 함께 구독해서 시스템 백버튼을 가로챈다. 모드별 이전 모드 매핑은 `src/back-nav.ts`의 `MODE_STACK`에 정의돼 있다.

| 현재 모드 | 백버튼 시 의도 모드 | confirm |
| --- | --- | --- |
| `explore` | (앱 종료) | — |
| `quiz-difficulty` | `explore` | — |
| `quiz` | `quiz-difficulty` | "퀴즈를 중단하시겠어요?" 다이얼로그 |
| `quiz-ad-gate` | `quiz-result` | — (게이트 자체가 modal 성격) |
| `quiz-result` | `explore` | — |

- confirm dialog는 TDS Portal 기반 ConfirmDialog가 jsdom에서 unmount DOMException을 일으켜서 자체 인라인 `.modal-overlay` / `.modal-card` 컴포넌트로 교체했다. 토스앱 환경에서도 동일하게 렌더링된다.
- 모드 전환 시 `history.pushState({mode})`로 진입 이력을 쌓고, `popstate` 리스너가 한 단계 전 모드로 `setMode`한다. 백으로 인한 모드 변경은 `fromBackRef`로 pushState 중복을 막는다.

## 상세 설명

원소 주기율표는 118개 원소를 작은 화면에서도 빠르게 탐색할 수 있게 정리한 교육형 미니앱입니다. 사용자는 앱에 들어오면 모바일 주기율표와 원소찾기 버튼을 보고, 원소 이름, 기호, 원자번호로 검색하거나 분류 칩을 눌러 원하는 원소를 고릅니다. 원소 카드를 열면 원자번호, 기호, 한국어/영어 이름, 원자량, 전자배치, 전기음성도, 밀도, 발견 연도와 짧은 설명을 확인할 수 있고, 퀴즈 풀기 버튼을 눌러 5문항 복습 퀴즈로 기억을 점검할 수 있습니다.

## 정책 설명 메모

- 전문 화학 실험, 안전, 의료, 위험물 판단을 대신하지 않는 교육형 참고 도구로 설명한다.
- 로그인, 결제, 광고, 외부 링크, 개인정보 서버 저장은 없다.
- 검증 근거가 부족한 위험도 값은 노출하지 않는다.
- PubChem Periodic Table CSV와 대한화학회 제정 원소 이름을 앱 번들에 포함해 사용한다.

## 이미지 등록

| 자산 | 로컬 파일 | 규격 | 콘솔 반영 |
| --- | --- | --- | --- |
| 앱 로고 | `public/periodic-table-icon-600.png` | `600 x 600` PNG, 투명 배경 없음 | `https://static.toss.im/appsintoss/38345/045e816d-d16d-4ca8-839f-ebb99e97eb09.png` |
| 썸네일 | `public/periodic-table-thumbnail-1932x828.png` | `1932 x 828` PNG | 중앙 크롭에서 제목과 핵심 화면이 잘리지 않는지 확인 |
| 스크린샷 1 | `public/screenshots/periodic-table-start-636x1048.png` | `636 x 1048` PNG | 첫 화면 |
| 스크린샷 2 | `public/screenshots/periodic-table-detail-636x1048.png` | `636 x 1048` PNG | 원소 카드 |
| 스크린샷 3 | `public/screenshots/periodic-table-quiz-636x1048.png` | `636 x 1048` PNG | 퀴즈 |

## 코드 동기화 기준

- SDK 3.x는 `granite.config.ts`를 `apps-in-toss.config.ts`로 옮기고 `brand.displayName` / `brand.icon` / `webViewProps.type`을 설정에서 제거했다. 이 값들은 전부 콘솔 메타데이터에서만 관리한다.
- 코드에서 동기화해야 하는 값은 `index.html`의 `<title>`과 `apps-in-toss.config.ts`의 `appName` / `brand.primaryColor`, 그리고 콘솔 한국어 앱 이름, 앱 첫 화면 타이틀뿐이며 모두 `원소 주기율표` / `periodic-table` / `#1F8A70`으로 맞춘다.
- `appName`은 등록 후 수정할 수 없으므로 콘솔 등록 전 `periodic-table` 최종 확정을 다시 확인한다.
- spec `app.iconUrl`은 콘솔 업로드 후 복사한 HTTPS URL `https://static.toss.im/appsintoss/38345/045e816d-d16d-4ca8-839f-ebb99e97eb09.png`로 맞춘다.
- 앱 내 기능명은 한국어 10자 이하, 영어 15자 이하 조건을 만족한다.
- 퀴즈 전면광고 단위 ID는 콘솔에서 발급 후 `.env.production`의 `VITE_AIT_AD_GROUP_ID`에 주입한다. 개발 단계 기본값 `ait-ad-test-interstitial-id`는 콘솔에서 발급한 실제 ID로 교체하기 전까지만 사용한다.
- 마지막 답 직후 전면광고는 즉시 표시하지 않고 "광고 보고 결과 보기 / 광고 없이 결과 보기" 두 선택지가 있는 광고 게이트(`mode: "quiz-ad-gate"`)를 먼저 보여준다. UX 정책(No Deception, Clear Action)을 만족시키기 위함.

## 출시 전 확인 필요

- 고객센터 전화번호와 채팅 상담 URL 사용 여부를 확정한다.
- `intoss://periodic-table/elements?element=O`, `intoss://periodic-table/quiz` 진입을 토스 앱 preview에서 확인한다.
- 사람 테스트에서 첫 진입, 검색 후 원소 카드 확인, 분류 필터, 퀴즈 완료, 토스 앱 preview를 확인한다.
