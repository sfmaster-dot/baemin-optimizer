# CONTEXT — baemin-optimizer

## 비즈니스

자영업 음식점 사장님이 5개 배달 플랫폼의 가게정보·메뉴·할인·광고·리뷰를 빠짐없이 최적화하도록 돕는 체크리스트 + AI 문구 생성 도구. 셀프서비스에서 흩어져 있는 항목을 한 화면에 묶고, 항목별로 가이드·규격·자가검증 기준을 제공한다. 다점포 사장님을 위해 매장 단위로 진행률·AI 캐시를 분리 저장한다.

## 플랫폼 5개

`PLATFORMS` (src/data/checklist.js:11)에 정의된 ID 그대로 사용한다.

- `baemin` — 배달의민족
- `coupang` — 쿠팡이츠
- `yogiyo` — 요기요
- `ddanggyo` — 땡겨요
- `mukkebi` — 먹깨비

플랫폼별로 `SECTIONS`/`CHECKLIST` 묶음이 독립적이고, `getSections(id)`·`getChecklist(id)`·`getTotalCount(id)`로 조회한다.

## 체크리스트 구조

**섹션**: 플랫폼별 카테고리(`section`) — 배민은 6개(가게관리·메뉴·할인·광고·리뷰·가게통계).

**항목**: 섹션 내 카드(`id`, `section`, `name`, `badge`, `cycle`, `desc`, `guide`, ...). 배민 기준 id 1~28 + 광고 효율/가게통계 확장 항목들.

**가이드 페이로드**: `guide.points[]`(원칙 텍스트), `guide.spec`(규격 표), `guide.tip`(등록 위치), `guide.warn`(경고), `guide.warnTop`(상단 경고 배너), `guide.prerequisiteCheck`(사용 전 자가검증 체크박스). 한 항목이 위 필드를 자유롭게 조합한다.

**AI 훅**: 카드에 `aiType`·`aiLabel`이 있으면 카드 내부에 ✨ 버튼이 노출되어 `AiModal`을 그 타입으로 연다.

## 데이터 구조 (Firestore)

Firebase 프로젝트 `store-manager-f5a05` 공유 사용. 인증·환경변수는 `src/lib/firebase.js`, 매장 CRUD는 `src/lib/stores.js`.

```
baemin/{uid}                              ← 프로필 (activeStoreId 등)
baemin/{uid}/stores/{storeId}             ← 매장 문서
   ├── name, businessId, businessGroupName, categoryIds
   ├── checklists: { baemin: {1:true,...}, coupang: {...}, yogiyo: {...}, ... }
   ├── aiCache: { [cacheKey]: [{ts, content}, ...최근 10개] }
   └── shopInShops, createdAt, updatedAt
```

`checklists`는 **플랫폼 ID → 체크된 항목 ID 맵** 구조. App.jsx는 `Object.fromEntries(PLATFORMS.map(p => [p.id, {}]))`로 빈 객체를 동적으로 생성해 신규 플랫폼 추가 시 코드 변경 없이 따라간다.

## 핵심 설계 결정

- **debounce 저장 (App.jsx:142-148)**: 체크 토글 후 `800ms` 뒤 `saveStoreChecklist` 호출. 연타로 인한 Firestore 쓰기 폭주 방지.
- **빈 객체 마이그레이션 가드 (stores.js:78-84)**: `loadStore`에서 ① 구버전 단일 `checklist` 필드가 있으면 `checklists.baemin`으로 자동 이전, ② `checklists` 자체가 없으면 `{ baemin: {}, coupang: {} }` 기본값 주입. 새 플랫폼 ID(yogiyo·ddanggyo·mukkebi)는 App.jsx의 `checked[p.id] || {}` 패턴이 흡수하므로 마이그레이션 불필요.
- **AI 캐시 = 버전 히스토리 (stores.js:156-186)**: 매장·`cacheKey`별 최근 10개 보관. 동일 내용 중복 저장 차단. `reply`는 일회성이라 캐시 안 함.
- **localStorage `dgm_platform`**: 마지막으로 본 플랫폼 ID를 클라이언트에만 저장(매장과 독립).
- **사업자 그룹 4개 권장**: `MAX_STORES_PER_BUSINESS = 4` — 배민 정책 반영. `businessGroupName` 또는 `businessId`로 그룹핑, 둘 다 비면 `__unclassified__` 단일 그룹.

## AI 기능 7종

`aiType` 키 기준. `AiModal.jsx`가 타입별 입력 폼·프롬프트·결과 렌더링을 분기한다.

| `aiType`     | 용도                  | 입력                          |
| ------------ | --------------------- | ----------------------------- |
| `intro`      | 가게소개 200~400자     | storeName 등 정체성            |
| `notice`     | 사장님공지            | 이벤트·휴무·신메뉴            |
| `menuname`   | 메뉴명 SEO 3종         | menuName                      |
| `menudesc`   | 메뉴설명 후킹 60자 이내 | menuName, basePrice           |
| `reply`      | 리뷰답변 (별점별 톤)   | 리뷰 본문·별점 — 캐시 안 함    |
| `orderguide` | 주문안내 첫 줄         | storeName, firstLine          |
| `menuoption` | 메뉴 옵션 설계         | 단일 모드/메뉴판 모드 분기     |

(리뷰답변 카드의 `aiType` 표기는 `reply`로 통일 — `review` 표기는 사용하지 않는다.)

## 우리가게클릭 — 최고 재정 리스크 카드

배민 섹션 4(광고·서비스)의 `id:25` 카드. 클릭당 과금(CPC)이라 **주문이 없어도 비용이 발생**하는 유일한 광고 — 다른 광고는 주문 발생 시에만 과금. 적자 1순위 원인이 될 수 있어 항목 1~24가 모두 최적화된 뒤 마지막에만 검토하도록 게이팅한다.

**`prerequisiteCheck` 게이트**: `CheckItem.jsx:118-141`이 `guide.prerequisiteCheck` 블록을 렌더링 — 자가검증 체크박스 항목들과 경고 문구(`warn`). 사장님이 7개 전제(주문전환율·요일·시간대·최소주문금액·배달팁·마진·매장 매력)를 직접 ✓ 표시해야 사용 결정으로 넘어간다. `prerequisiteCheck`는 일반 패턴이지만 현재 가장 부담 큰 카드가 우리가게클릭이다.

## 환경

- **Windows / PowerShell** — bash의 `&&` 체이닝 ❌. 명령 분리 시 `;` 또는 `if ($?) {...}`.
- **빌드**: Vite 8 + React 19 + react-router-dom 7.
- **배포**: Vercel. `ANTHROPIC_API_KEY` + `VITE_FIREBASE_*` 6개를 환경변수로 설정.
- **인증**: Firebase Auth Google OAuth (`signInWithGoogle`).

## 도메인 용어집 (Glossary)

코드·이슈·문서에서 도메인 개념을 부를 때는 아래 용어를 그대로 쓴다. 동의어로 흘러가지 말 것.

- **플랫폼 (platform)** — `PLATFORMS` 배열의 다섯 ID 중 하나. `baemin` / `coupang` / `yogiyo` / `ddanggyo` / `mukkebi`. "배달앱"은 같은 의미지만 식별자에는 `platform`을 쓴다.
- **체크리스트 (checklist)** — 플랫폼 1개의 카드 배열. 카드 모음 전체. 단일 카드는 "항목"이라 부른다.
- **섹션 (section)** — 체크리스트 내 카테고리. 정수 `section: 1~6`로 카드를 묶는다.
- **항목 / 카드 (item / card)** — 체크리스트의 단일 단위. `{ id, section, name, badge, cycle, guide, ... }`.
- **매장 (store)** — 사장님이 운영하는 가게 한 곳. Firestore `baemin/{uid}/stores/{storeId}`. 다점포 사장님은 매장 여러 개를 가지며 그룹핑된다. **사용자(user)와 다른 개념** — 1 user ↔ N store.
- **사업자 그룹 (business group)** — `businessGroupName` 또는 `businessId`로 묶인 매장 모음. 권장 4개 이하.
- **활성 매장 (active store)** — 현재 화면이 보고 있는 매장. `activeStoreId`가 프로필에 저장됨.
- **AI 캐시 (aiCache)** — 매장·`cacheKey`별 AI 결과 히스토리(최근 10개). 버전 비교·복원용. `reply`는 일회성이라 캐시 안 함.
- **cacheKey** — AI 결과 식별자. 단일 타입은 `'intro'`, 메뉴별은 `'menuname:불향쭈꾸미덮밥'`처럼 `타입:식별자` 형식. `menuoption`도 메뉴별 분리하되 메뉴판 모드는 `'menuoption:board'` 단일 키.
- **`prerequisiteCheck`** — 카드 사용 전 사장님이 통과해야 할 자가검증 체크박스 블록. "사용 전 자가검증"으로 부른다. "전제 조건"이나 "선결 체크"로 흘리지 말 것.
- **배지 (badge)** — 카드 우선순위. `must`(필수) / `high`(권장) / `mid`(참고) / `optional`(선택) / `advanced`(고급 — 자가검증 필수).
- **주기 (cycle)** — 카드 갱신 주기 권장. `none` / `1m` / `3m` / `6m` / `weekly` / `adhoc`.
- **인트로 박스 (intro box)** — 섹션 진입 시 노출되는 접힘식 안내. `section.intro = { title, content }`.
- **셀프서비스** — 배민 등 배달 플랫폼이 사장님에게 제공하는 가게 관리 백오피스. 본 앱이 가이드하는 작업의 실제 입력처. "관리자 페이지"라 부르지 말 것.
- **우리가게클릭** — 배민 CPC 광고 상품의 고유명사. 코드 외 문서·이슈에서도 띄어쓰기·표기를 이 그대로 유지.
- **CPC / CPS** — 클릭당 과금 / 판매당 과금. 우리가게클릭은 CPC, 쿠팡이츠 광고는 CPS.
