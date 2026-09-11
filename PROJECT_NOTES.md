# 도쿄 해외연수 일정 대시보드 — 작업 노트 (인수인계용)

> 다른 컴퓨터에서 작업을 이어가거나 AI에게 맥락을 다시 설명할 때 쓰는 문서.
> 핵심 결과물은 `index.html` 하나이며, 브라우저에서 열면 바로 동작한다. (GitHub Pages 배포)

- 배포 주소: https://godsjch-ops.github.io/tokyo-trip/
- 저장소: https://github.com/godsjch-ops/tokyo-trip

---

## 1. 개요
- 목적: 해외연수(도쿄) 일정을 시간표로 관리 + 방문지/식당/숙소 정보 정리. 계획을 즉시 추가·수정·이동.
- 기간: 2026-09-14(월) ~ 09-18(금), 5일 / 장소: 도쿄 → 요코하마 → 시즈오카 → 하마마쓰 → 오사카 / 인원: 11명
- 성격: **연수(공식 방문 기관 9곳이 핵심)**. 관광·식당 비중 낮음. 식당 정보는 미수령(받으면 backlog에 kind:"food"로 추가).
- 데이터 기준: **2026-09-03 최종 계획서(PDF)**. OFFICIAL_ORGS/SPOTS/LODGING·buildOfficialEvents()가 이 확정본을 반영. seed 기본값도 동일.
- 형태: 단독 HTML 파일 1개(서버·빌드 불필요). PC·모바일 모두 사용.
- 공유: Firebase Realtime Database로 11명이 실시간 공유(같은 링크 접속 시 동일 데이터, 수정 즉시 반영).

## 2. 확정 사항
| 항목 | 값 |
|---|---|
| 결과물 | 단독 `index.html` |
| 디자인 | 미니멀·모던(흰 바탕, 파스텔 일정 블록, 파란 포인트) |
| 시간축 | 06:00~24:00, 30분 스냅 |
| 사진 | 이미지 URL + 로컬 업로드(자동 리사이즈·압축, 최대 1200px/JPEG 0.72) |
| 공유 | Firebase 실시간(설정 있으면 공유, 없으면 이 기기 localStorage 저장) |
| 모바일 | 요일 탭으로 하루씩 전체 화면 · PWA(오프라인) · 개인 메모 클라우드 백업 |
| 접속 | 첫 화면에서 성 포함 실명 입력 → `ROSTER_SEED`(11명) ∪ Firebase `roster`에 있으면 입장(1회, 기기 기억). 익명 인증 자동. `noindex` |
| 편집권한 | 로그인 이름이 `ADMIN_NAMES`(현재 `["주찬희","손지현"]`)에 있으면 편집. PIN 없음. 파괴적 함수는 `requireEditor()` 이중 방어 |

## 3. 현재 기능
### 일정표(주간 그리드)
- 5일 × 06~24시, 카테고리 색상(체험·방문/식사/이동/숙소/회의·연수/자유).
- 추가: 「＋ 일정 추가」 또는 빈 칸 클릭.
- 상세 팝업: 블록 본문 클릭 → 설명·소요시간·사진 슬라이드·구글맵·"상단 지도에서 보기".
- 드래그 이동(30분 스냅, PC는 요일 간 이동), 위·아래 손잡이로 시간 조절.
- 단축키:
  - Ctrl+드래그 = 일정 복제
  - Ctrl+C / Ctrl+V = 마우스 올린 일정 복사 → 커서 위치에 붙여넣기
  - 일정 클릭(선택, 파란 테두리) 또는 마우스 오버 후 Delete = 삭제
  - (입력창 타이핑 중·편집 폼 열림 시 단축키 비활성)

### 상단 지도
- 구글 "내 지도(My Maps)" 임베드(MYMAPS_MID). "전체 핀 보기", "저장한 방문지 목록 열기" 버튼.

### 좌측 사이드바(상세보기) + 하단 후보/숙소 — 통합됨
- 방문지 / 식당 / 숙소는 **좌측 상세보기와 하단 카드가 같은 데이터**(한 곳에서 추가·수정하면 양쪽에 반영).
  - 하단 "후보(방문지·식당)" = 좌측 "방문지 상세보기" + "식당 상세보기"
  - 하단 "숙소" = 좌측 "숙소 상세보기"
- 후보에는 분류(방문지/식당) 필드가 있고 카드에 배지 표시. 항목은 제목·메모·링크·구글맵 위치·사진 지원.
- 후보 카드를 일정표로 드래그 → 일정 등록(후보 목록엔 그대로 유지, 참고용).
- 좌측 전용(하단 짝 없음): "쇼핑 꿀팁", "방문지역 역사".

### 현장 모드 (모바일 전용) — `#fieldMode`
- 폰 폭 ≤760px면 자동 진입, 어느 화면에서나 헤더 「📱 현장 모드」/「대시보드 ▸」로 전환. 마지막 선택은 `localStorage.tw_view`(field|dash).
- 하단 탭 5개: **오늘 / 기관 / 숙소 / 식당 / 전체**. (전체 = 메모·설정 화면, `viewFieldMore()`)
  - 오늘: `computeTodayIdx()`로 오늘 필터. 여행 전이면 D-day + 날짜 셀렉터. 여행중이면 "지금 진행 중/다음" 카드 + 타임라인(지난 건 흐리게). `ref` 있는 일정엔 "기관 정보" 버튼.
    - **iOS풍 날짜 스와이프**: 타임라인을 손가락으로 좌우로 밀면 날짜 이동. `viewFieldToday`가 `.fm-stage>.fm-track>.fm-page` 구조로 렌더, `fmTimelineHtml(di)`가 하루 단위 HTML 생성. `fmSetupSwipe()`가 `#fmBody`에 touch(start non-passive/move non-passive로 preventDefault) 바인딩 → 드래그 중 인접 날짜 페이지(`.fm-page.adj`)를 만들어 손가락 따라 이동(미리보기), 임계(70px/20%) 넘으면 `FM_EASE`로 슬라이드 후 `fmState.day` 커밋·재렌더. 세로 스크롤은 lock='v'로 무시, 경계는 감쇠(rubber-band). 셀렉터 아래 날짜 점(`.fm-daynav`).
  - 기관: `backlog`의 `kind:"org"` 9곳 카드를 **일자별 그룹**(`.fm-daygroup`+`.fm-dayhead`, 그룹 간 간격)으로 표시 → 시트(정보 + 공식 홈페이지 + **📄 기관자료 자세히보기** + 접이식 지도 + 메모). 아래 관광(kind:"visit")도 표시.
    - 기관(kind:"org") 시트는 길찾기 대신 `o.doc||ORG_DOC_FALLBACK` PDF를 새 창으로 엶(차량 단체 이동이라 길찾기 불필요). 2026-09-09부터 9곳 모두 `OFFICIAL_ORGS`의 `doc:"./핸드북/N. ….pdf"`(기관별 사전조사 자료)를 가리킨다. 관광(kind:"visit")은 기존 길찾기 유지.
  - 숙소: `lodging` 카드, 오늘 밤 숙소 강조(`fmPeriodCoversDay`). 시트에 접이식 지도 + 메모.
  - 식당: `kind:"food"` 없으면 "준비 중" 안내 + 일정표 meal 블록 목록.
  - 전체(메모·설정): 내 이름 설정(`saveMyName`), 내 메모 내보내기 — **HTML 저장**(`downloadMemos`, `buildMemoHtml`이 사진 data:URI까지 담은 단독 HTML 문서 생성) / **인쇄·PDF**(`printMemos`, 새 창에 HTML 쓰고 자동 `print()` → "PDF로 저장") / **공유**(`shareMemos`, Web Share로 .html 파일, 안되면 텍스트 요약 복사). 사진이 있으면 .txt로는 담을 수 없어 HTML로 전환함(`buildMemoText`는 텍스트 요약용으로 유지). **내 메모 모아보기**(`collectMyMemos`가 `tw_memodoc_p_*` 스캔 → 카드, 탭하면 `openSheetById`로 해당 시트 열기). "PC 대시보드로 전환"(`exitFieldMode`).
- **상세 시트(iOS풍)**: `.fm-sheet>.panel(.sh-grip+.sh-scroll>.sh-track>.sh-page)`. 열기=아래에서 슬라이드업(`_sheetShow`가 리플로우 후 `.on` 토글, 백드롭 페이드). 빌더 `buildOrgSheet/buildLodgingSheet/buildEventSheet`→`{html,memoId}`, 오프너 `openOrgSheet/openLodgingSheet/openEventSheet`가 `_sheetNav`(같은 종류 목록+idx+open) 설정 후 표시.
  - **끌어 닫기 + 좌우 이동**: `fmSetupSheetGestures()`가 `#fmSheetPanel`에 터치 바인딩. 첫 이동으로 방향 lock — 세로(손잡이 또는 스크롤 top에서 아래로)=패널 translateY 따라가다 110px↑ 놓으면 닫힘(백드롭 동반 페이드), 가로=`.sh-track` 이동 + 인접 항목 가벼운 미리보기(`sheetPreview`, 지도·메모 제외) 표시하다 임계 넘으면 `_sheetNav.open`으로 이전/다음 항목 전환. 스크롤은 lock='scroll'로 통과.
  - `fmEventTap`: `ref` 있으면 기관 시트로(연동 유지), 없으면 `openEventSheet`. 이벤트 시트에도 `ref`면 "🏛️ 기관 정보 보기" 버튼.
- **접이식 지도**: 시트 지도는 `mapBlock(loc)`로 생성(기본 접힘), `toggleSheetMap()`으로 펼침/접힘. loc 없으면 미표시.
- 상단 식사 카테고리 줄(`.fm-meals`)은 표시하지 않음(`renderFmTop`에서 비움, `:empty{display:none}`).
- **메모** (기관/숙소/일정 시트 공용) — 개인/공유 모드 분리, sheetId 예: `org:org-5`, `lodging:lg-2`, `event:o-2-0950`(기관 탭·일정표 어디서 열든 같은 sheetId).
  - **개인 = 노션형 리치텍스트 문서 + 30초 자동저장**: `contenteditable` 1개 + 툴바(굵게/밑줄/목록, `execCommand`). `memoStartAutosave()`가 30초마다 dirty면 `memoSavePersonal(true)`로 조용히 저장 후 "✓ 자동저장 완료" 잠깐 표시. 시트 닫기/탭 전환/모드 전환 시에도 자동 저장(`memoOnCloseSave`). 저장소 `localStorage` `tw_memodoc_p_<sheetId>`(HTML). 에디터 스크롤바 상시 노출(`.memo-editor{overflow-y:scroll}`+webkit 스타일).
  - **공유 = 게시글 피드**(저장=글 추가): 작성 `contenteditable`(`.memo-compose`) + 툴바 + 올리기 → `memoPost()`가 Firebase `trips/tokyo2026/memos/<sheetId>` **push**(옛 모델 복원). fbdb 없으면 `tw_memo_s_<sheetId>` 목록 폴백. `renderPostList()`가 최신순 카드(작성자·시각·삭제, 내 글 강조). 옛 글의 `text` 필드도 호환 렌더.
  - **보안**: 공유 메모=타인 작성=신뢰 불가 → `memoSanitize()`가 허용 태그(b/strong/u/i/em/br/div/p/span/ul/ol/li)만 남기고 속성 전부 제거(XSS 방지). 개인 문서/다운로드 텍스트(`memoHtmlToText`)도 동일 정화.
- 헤더 「📋 PDF 일정표 불러오기」= `loadOfficialItinerary()`: JSON 백업 자동저장 → 확인 → `events`/`backlog`(org·spot)/`lodging`을 PDF 확정본으로 **전면 교체**(kind:"food"·메모는 보존). 상수: `OFFICIAL_ORGS / OFFICIAL_SPOTS / OFFICIAL_LODGING / DAY_MEALS / buildOfficialEvents()`.

### 최근 개선 (2026-09-03, 4단계)
1. **메모 안정성**: 개인 메모 = 이 폰 localStorage(1차) + Firebase `pmemos/<이름or기기>/<sheetId>`(2차 백업). 로컬이 비면 자동 복구, 더 최신이면 안내. 저장 실패 시 경고 배너. 공유 메모 "올리기" = 대기열(`tw_memo_pending`)에 먼저 확보 → 성공 시 제거, 실패 시 "⚠ 전송 실패·다시 시도", 연결 복구(`​.info/connected`·`online`) 시 자동 재전송. 작성 중 글은 `tw_memo_draft_<sheetId>`에 임시저장.
2. **오프라인(PWA)**: `manifest.json` + `service-worker.js`(+아이콘 3개 + 해외연수 계획서 PDF 선캐시). 한 번 열면 신호 없이도 열림. HTML은 네트워크 우선, 나머지 캐시 우선, Firebase 실시간·구글지도는 SW가 손대지 않음. 시트 지도는 펼칠 때 로드, 오프라인이면 길찾기 링크로 대체. ASSETS 변경 시 `CACHE` 버전 올릴 것(현재 `tw-tokyo-v4`).
3. **읽기 개선**: 현장 모드 글씨 확대. 기관 시트 = 개요/방문 목적/사전 질문·확인 포인트 구조(`OFFICIAL_ORGS`의 `desc`/`purpose`/`points`). 담당자·홈페이지는 본문에서 제거(홈페이지는 버튼 유지). **purpose/points는 초안** — 사전 조사 자료 나오면 교체 후 관리자가 "PDF 일정표 불러오기" 1회 실행해야 공유 DB에 반영.
4. **숙소 연동**: `lodgingForEvent()`가 stay 일정 블록을 장소/이름으로 숙소 카드에 매칭 → 어디서 열든 `memoId=lodging:<id>`로 통일(메모 공유). 숙소 시트에 "공유 메모로 꿀팁" 안내.
5. **공유 메모 수정**: 내 글은 "수정" → 인라인 서식 편집 → 저장(`edited:true`, "수정됨" 표시).
6. **접속·편집 게이트**(2026-09 재설계): 첫 화면 `#loginGate` → `matchRoster()`(정확/포함/오타1글자, 성만은 거부) 통과 시 `LOGIN_NAME` 저장(`tw_name`+`tw_login_ok`)·입장, 재방문 시 안 물음. 앱 로드 시 `signInAnonymously()`(`initFirebaseAuth`, 6초 타임아웃) — 접근통제가 아니라 규칙 `auth != null` + 쓰기 검증용. 편집은 `isAdminName(LOGIN_NAME)`(=`ADMIN_NAMES`) → `body.viewer` 토글. 관리자 화면(현장 모드 전체 탭): `roster` 추가/삭제, 스냅샷 복원. 규칙 JSON은 [`firebase-rules.json`](firebase-rules.json), 세팅 절차는 [`연수전_체크리스트.md`](연수전_체크리스트.md).
   - **동시 편집 안전**: `saveEvents/persistBacklog/persistLodging/persistDetail` → `fbReconcile()` 가 `_fbShadow`(리스너가 갱신하는 원격 상태)와 비교해 **바뀐 항목만** `ref.update({id:obj|null})`. 통째 `.set()` clobber 없음.
   - **스냅샷**: `snapshotWrite(reason)` → `snapshots/<pushId>`에 events/backlog/lodging/detail 맵. 자동 15분(변경 시, 관리자만) + `load-official`/`import`/`pre-restore` 직전. `snapshotPrune()` 최근 30개. `snapshotRestore(key)` = pre-restore 저장 후 멀티패스 `ref().update()`.
   - **오프라인 캐시**: 리스너가 `tw_cache_*`에 마지막 데이터 저장, `hydrateFromCache()`가 로드 시 즉시 표시. 상단 주황 띠 `#netOffline`(`updateNet`, `.info/connected`·online/offline).
   - **9/14부터** `#btnLoadOfficial` 자동 숨김. `loadOfficialItinerary`/`importJSON`은 `typedConfirm(...,"전면교체")`.
7. **메모 UX 재설계**: 시트 = 브리핑 → `.sh-hinge`("여기부터 내 기록") → `.sh-memozone`(스크롤 시 떠오름) → 편집기. `#fmSheetJump` 플로팅 버튼으로 정보↔메모 이동. 편집기는 말풍선 없이 전면(`.memo-editor` 테두리·내부 스크롤 제거, min-height 280). 툴바 `position:sticky`, **B/U/제목(H3)/목록/색상 5종/이미지**. 이미지 = `memoCompressImage`(가로 900px·JPEG 0.55) → `<img data:>` 삽입, 개인·공유 공통. `memoSanitize`가 `IMG[src=data:image]`·`FONT[color=#hex]`·`SPAN[style=color/bg만]`·`H1~3` 허용(그 외 속성 제거 유지).
   - 다음 단계(보류): 기관 브리핑을 관리자 편집 모드에서 앱 내 직접 수정(현재는 `OFFICIAL_ORGS` 코드 상수, 초안 반영 후 전환 예정)
8. **새 글 배지**: 공유 메모가 올라오면 하단 탭(기관·숙소)에 카톡식 빨간 숫자 배지, 해당 기관/숙소 카드 좌상단에 빨간 점. `memos_meta`(count·lastTs) 리스너 + 로컬 `tw_seen_<sheetId>`(마지막으로 본 글 개수) 비교. 시트에서 메모 영역까지 스크롤하면 읽음 처리. 최초 로드 시 이미 있던 글은 읽음 간주(`_memoMetaInit`).
9. **사진 편집기**(`#mie` 오버레이 z90): 업로드하면 바로 넣지 않고 자르기(드래그 크롭 + 비율 자유/1:1/4:3/3:4) + 크기(작게480/보통800/크게1200/원본) 선택 후 캔버스로 재인코딩(JPEG 0.5~0.62). 이미 넣은 사진 탭 → 다시 편집. `memoImgEditOpen/Apply/Close`, `_ie` 상태, `memoCompressImage`는 폴백.
   - **터치 조작**(`_ieBind`): Pointer Events + `setPointerCapture`(손가락이 스테이지 밖으로 나가도 추적), 스테이지/프레임/핸들 전부 `touch-action:none`, 열릴 때 `html.mie-open`으로 배경 스크롤 잠금, 스테이지 `padding:28px`로 사진 가장자리에서도 핸들 안 잘림. 프레임: 4모서리 브라켓 + 4변 핸들(히트영역 46px, `.hd[data-h]`), 내부 드래그=이동, 최소 46px, 드래그 중 3분할 그리드(`.mie-crop.drag:after`). 비율 고정 시 모서리=폭 기준, 변 핸들=중앙 고정으로 반대축 맞춤.
   - **공유 메모 사진 상한**: `_memoMode==="s"`면 크기 옵션에서 크게·원본 숨김 + `memoImgEditApply`에서 800px로 강제(11명 전체 전송 대비). 개인 메모는 4단 그대로. 안내문 `#mieSizeHint`.

### 저장·공유
- Firebase 실시간 동기화. 헤더에 "실시간 공유 중" 표시.
- 「내보내기/불러오기」: JSON 백업/복원(events·backlog·lodging).

### 현장 점검 반영 (2026-09-07)
실제 브라우저에서 시계를 연수 당일로 돌려 재현·검증한 뒤 고친 것들.

1. **시각·날짜 자동 반영** (`tickClock`, 파일 맨 끝) — 예전에는 `nowM`이 렌더 시점 값으로 고정돼, 폰을 꺼내면 한참 전 일정이 "지금 진행 중"으로 남아 있었고 자정을 넘겨도 날짜가 안 바뀌었다. 30초 타이머 + `visibilitychange`/`pageshow`/`focus`에서 `tickClock()` 호출.
   - 분이 바뀔 때만 다시 그린다. **날짜 스와이프 중·상세 시트 열림·오늘이 아닌 날짜를 보는 중에는 건너뛴다**(다음 틱에 반영).
   - 다시 그릴 때 `#fieldMode`의 `scrollTop`을 복원해 읽던 위치가 튀지 않는다.
   - 날짜가 바뀌면 `TODAY_IDX`/`mobileDay`/`fmState.day`를 갱신하고 `render()` 전체 실행. 연수 **전** D-day 감소도 `_tickDate`(날짜 키) 비교로 잡는다.
2. **공유 메모 삭제 = 본인 글만** (`renderPostList`/`memoDel`) — 예전에는 "삭제"가 남의 글에도 렌더돼 11명 누구나 실수로 지울 수 있었다(규칙도 `auth != null`이라 서버에서 안 막힘). 버튼을 `mine`으로 감싸고 `memoDel()`에서 작성자 이름을 한 번 더 확인.
3. **개인 메모 클라우드 백업 실패를 알린다** (`memoPDocSet`/`memoShowCloudWarn`) — `pmemoRef().set()`은 비동기로 reject되므로 기존 `try/catch`가 못 잡았다. 사진이 커서 규칙 용량 제한에 걸리면 **아무 표시 없이** 백업이 실패했다. `.catch()`로 받아 "용량 초과"인지 "신호 문제"인지 구분해 경고 배너 표시. 성공하면 배너를 지운다.
   - 함께: 사진 편집기의 '원본' 상한 2000px → 1400px, `firebase-rules.json`의 메모 1건 한도 500KB → 1MB. **규칙은 콘솔에 다시 붙여넣어야 적용됨**(체크리스트 1-2).
4. **느린 네트워크에서 흰 화면 방지** (`service-worker.js`) — HTML 네트워크 우선 fetch에 타임아웃이 없어, 호텔 와이파이·캡티브 포털·로밍 전환처럼 "연결은 됐는데 응답이 없는" 상태에서 계속 매달렸다. `Promise.race`로 3초 타임아웃 후 캐시 폴백. `CACHE`를 `tw-tokyo-v4`로 올림 → **배포 후 각 폰이 온라인에서 1회 열어야 캐시가 새로 만들어진다**.
5. **비상 연락처 시트** (`EMERGENCY` 상수 / `buildEmergencySheet` / `openEmergencySheet`) — 현장 모드 헤더 🆘 + PC 헤더 "🆘 비상". `tel:` 링크로 바로 통화. 오늘 밤 숙소 전화는 `lodging`의 `desc`에서 `telFromText()`가 자동으로 뽑아 맨 위에 붙인다. 통역가이드 번호가 9/14 첫 일정 desc 안에 묻혀 있던 문제 해결.
   - **개인 번호는 소스에 두지 않는다.** 이 저장소는 공개라 `index.html`에 넣으면 git 히스토리에 영구히 남는다. 인솔진·가이드 번호는 Firebase `contacts` 노드에 있고(규칙상 로그인한 사람만 읽힘), 관리자가 **더보기 → 관리자 · 비상 연락처**에서 추가/삭제한다. 코드의 `EMERGENCY_PUBLIC`에는 110·119·영사콜센터 같은 공개 번호만 둔다.
   - 번호는 `telNormalize()`가 `+82`/`+81` 국제전화 형식으로 바꿔 저장 — 로밍 중에도 걸린다.
6. **부관리자 추가** — `ADMIN_NAMES`에 손지현. 주찬희 폰이 방전·분실돼도 일정 수정·명단 추가·스냅샷 복원이 가능하다.
7. **확대 잠금 해제** — viewport에서 `maximum-scale=1.0, user-scalable=no` 제거. 안드로이드 크롬이 이걸 존중해 참가자가 글씨를 못 키웠다.

> 검증 못 한 것: **서비스워커 동작은 실기기 확인 필요.** 개발용 브라우저 패널이 서비스워커 등록 자체를 막아(빈 1줄짜리 SW도 동일하게 실패) 오프라인·3초 타임아웃 경로는 런타임으로 확인하지 못했다. 문법 검사(`node --check`)만 통과.

### 기관 자료 · 연수 핸드북 반영 (2026-09-09)
`핸드북/` 폴더에 들어온 전체 핸드북 1개 + 기관별 사전조사 자료 9개 PDF를 앱에 연결했다.

1. **연수 핸드북 버튼** (`HANDBOOK_DOC`, `openHandbook()`, `handbookBtnHtml()`) — 현장 모드 **오늘 탭 최상단**(`viewFieldToday()` 첫 줄, 날짜 셀렉트 위)과 PC 툴바에 배치. **날짜 스와이프 스테이지(`.fm-stage`) 바깥**이라 좌우로 날짜를 넘겨도 버튼은 항상 같은 자리에 남는다. 스타일은 `.fm-handbook`.
2. **기관별 PDF 연결** — `OFFICIAL_ORGS` 9개 항목에 `doc:` 추가. ⚠️ **파일 번호와 앱 번호가 1↔2만 어긋난다**: `1. 메이지가쿠인대학…pdf` → `org-2`(② 강연), `2. Sports of Heart.pdf` → `org-1`(① SOH). 3~9번은 그대로 일치.
3. **개요·목적·질문 갱신** — 9곳의 `desc`/`purpose`/`points`를 사전조사 자료 기준으로 교체(설립연도·대표·규모·재원 등 사실 위주).
4. **코드 우선 병합** (`orgBrief()` → `buildOrgSheet()`) — 화면 데이터는 Firebase `backlog`에서 오므로 상수만 고치면 반영되지 않는다. 그래서 공식 기관은 `OFFICIAL_ORGS`의 `day/time/field/desc/purpose/points/doc`를 **저장본보다 우선** 적용한다(제목·장소·홈페이지는 편집값 유지). 전면교체 버튼을 누를 필요가 없고, 연수 시작 후 잠긴 상태에서도 반영된다.
   - 부수 효과로 기존 결함이 막힌다: `saveBacklog()`는 `{id,title,desc,url,loc}`만 다시 만들어 저장하므로, PC에서 기관을 한 번 수정하면 `purpose`·`points`·`time`·`field`·`day`가 통째로 사라졌다. 이제 시트 렌더 시 코드에서 되살아난다. (`viewFieldOrgs()`의 목록 그룹핑은 아직 저장본을 그대로 쓴다 — 남은 과제.)
   - 대신 **PC 편집 폼에서 기관 개요(`desc`)를 고쳐도 코드 값이 이긴다.** 기관 개요는 앞으로 `OFFICIAL_ORGS`에서 관리한다.
5. **오프라인 선캐시** — `service-worker.js` ASSETS에 PDF 10개(약 4MB) 추가, `CACHE`를 `tw-tokyo-v5`로 올림 → **배포 후 각 폰이 온라인에서 1회 열어야** 캐시가 새로 만들어진다.
6. 검증: `node --check`(index.html 인라인 JS·service-worker.js) 통과. 로컬 서버 + 실제 Firebase 데이터로 오늘 탭 5개 날짜 전부에서 버튼 유지, 9곳 시트의 PDF 링크 HTTP 200 및 개요·목적·질문 갱신 확인. 서비스워커는 이번에도 실기기 확인 필요.

### 트러스트뱅크 Zoom 장소 · 첫날 석식 식당 반영 (2026-09-11)
1. **⑥ 트러스트뱅크 Zoom 회의실 확정** — TKP가 8/25 발행한 견적서(`Zoom 장소 예약내역.pdf`) 기준. 장소 **TKPガーデンシティPREMIUM横浜西口**(横浜市西区南幸2-19-9 TKP横浜ビル) · 회의실 **ミーティングルーム5B** · 9/16(수) 회의실 예약 13:30~15:30(회의 블록은 13:30~15:00 유지). `OFFICIAL_ORGS` org-6 `loc`·`desc` + `buildOfficialEvents()` 9/16 회의 블록 `loc`·`desc` 수정.
2. **첫날(9/14) 석식 식당** — 구글맵 링크로 받은 **しゃぶしゃぶ温野菜 五反田店別館**(東京都品川区西五反田1-5-2 トラヤビル8F · 五反田역 도보 2분 · ☎ 03-6421-7429 · 16:00~23:00). `OFFICIAL_SPOTS`에 `{id:"food-1",kind:"food"}` 추가(식당 탭에 표시) + `buildOfficialEvents()` 9/14 "석식·소감나눔" 블록에 상호·주소 기입.
3. **ATC 핸드북 교체** — `핸드북/8. ATC 에이지리스센터.pdf`를 내용 보강본(플로어 가이드·존별 설명·질문자료 추가)으로 교체. `CACHE`를 `tw-tokyo-v6`로 올림.
4. ⚠️ **공유 DB 반영 필요**: `loc`·이벤트·`kind:"food"`는 코드 우선 병합 대상이 아니라 Firebase `backlog`/`events`에서 온다. 배포 후 9/14 전에 PC에서 **「📋 PDF 일정표 불러오기」 1회 실행**해야 11명 화면에 반영된다(메모·기존 food 보존). 안 하면 org-6 개요 문구만 바뀌고 지도·이벤트 장소·식당 카드는 그대로.
5. `Zoom 장소 예약내역.pdf` 저장소에 추가 — TKP 담당자명·전화·이메일 블록은 PyMuPDF `apply_redactions()`로 실제 텍스트까지 제거한 뒤(가림이 아닌 삭제) 커밋(견적금액·견적서번호 등 나머지 내용은 그대로).
6. 검증: `node --check` 통과.

### D-3 리스크 점검 · 버그 수정 (2026-09-11)
전체 점검 결과와 주말 할 일은 [`연수_D-3_리스크점검.md`](연수_D-3_리스크점검.md). 코드에서 고친 것:
1. **PC 편집 폼이 `kind`를 지우던 버그** — `saveBacklogItem`(하단 후보 폼)·`saveDetailItem`(좌측 상세보기 폼) 모두 `{id,title,desc,url,loc(,photos)}`만 다시 만들어 저장해서, 기관·식당을 한 번이라도 PC에서 수정하면 `kind`가 사라져 **현장 모드 기관 탭·식당 탭에서 빠졌다**(orgBrief 병합은 desc/purpose 등만 되살리고 kind는 안 되살림). 이제 `{...prev, ...폼값}`으로 기존 필드 보존. 좌측 폼은 분류 셀렉트에 '기관'이 없어 org를 저장하면 visit로 강등되던 것도 `prev.kind==="org"`면 유지.
2. `loadOfficialItinerary()`를 두 번 실행하면 `OFFICIAL_SPOTS`의 식당(`food-1`)이 `keepFood`로도 살아남아 중복되던 것 — 코드에 있는 id는 `keepFood`에서 제외.
3. `EMERGENCY_PUBLIC` 영사콜센터 `tel`이 `+82233210404`(3321)로 잘못 들어가 있었음 → `+82232100404`. 주일본대사관 긴급(+81-70-2153-5454)·주오사카총영사관 긴급(+81-90-3050-0746) 추가(외교부 재외공관 페이지 기준).
4. `viewFieldFood()` 목록은 desc 첫 줄만(숙소 목록과 동일).
5. ⚠️ 여전히 **9/13(일) 자정 전 「📋 PDF 일정표 불러오기」 1회 실행** 필요(A-1). 9/14부터 잠김.

## 4. 데이터 구조
### Firebase (Realtime DB) 노드
```
trips/tokyo2026/
  events   : { id: {…} }
  backlog  : { id: {…} }   // 방문기관(org)·관광(visit)·식당(food)
  lodging  : { id: {…} }   // 숙소
  detail/shopping : { id: {…} }
  detail/history  : { id: {…} }
  memos/<sheetId>/<pushId> : { name, html, ts, edited? }   // 현장 모드 공유 메모 (항목 단위 push)
  memos_meta/<sheetId> : { count, lastTs }                 // 새 글 배지용 요약(글 로드 시 자동 갱신)
  pmemos/d_<기기ID>/<sheetId> : { html, ts, name }         // 개인 메모 동시 저장 (기기ID 기준, 화면엔 본인만)
  roster/<pushId> : { name, by, ts }                       // 관리자가 추가한 접속 허용 이름 (기본 11명은 코드 ROSTER_SEED)
  contacts/<pushId> : { label, show, tel, by, ts }         // 🆘 비상 연락처의 개인 번호 (소스에 두지 않음)
  snapshots/<pushId> : { ts, by, reason, events{}, backlog{}, lodging{}, detail{} }  // 일정 자동 백업, 최근 30
```
- localStorage 전용: `tw_memodoc_p_<sheetId>`(개인 메모 본문) / `tw_memodoc_pts_<sheetId>`(수정시각) / `tw_memo_pending`(공유 전송 대기열) / `tw_memo_draft_<sheetId>`(공유 작성 중) / `tw_uid`(기기ID) / `tw_name`+`tw_login_ok`(로그인 이름) / `tw_cache_events|backlog|lodging|detail`(오프라인용 마지막 데이터)
- 코드에서는 배열로 다루고 저장 시 id 맵으로 변환(toMap). 실시간 리스너가 배열로 되돌려 화면 갱신.
- localStorage 키(공유 미사용 시): tokyo_trip_2026_events / _backlog / _lodging / _detail_<key>

### 레코드
```js
event   : { id, day(0~4), start:"HH:MM", end:"HH:MM", cat, title, loc, desc, photos:[], ref? }  // ref = 연결된 org id
backlog : { id, kind:"org"|"visit"|"food", title, desc, url, loc, photos:[], day?, time?, field?, host? }
lodging : { id, title, period, desc, url, loc, photos:[] }                 // 숙소
detail  : { id, title, desc, url, loc, photos:[] }                         // shopping/history
```
- 카테고리 키: visit / food / lodging / shopping / history  (일정 cat: visit·meal·move·stay·meet·free)
- 통합 접근 헬퍼: catItems(key) / catFind(key,id) / catUpsert(key,obj) / catRemove(key,id)
  - visit·food·org → backlog(같은 배열, kind로 구분 / catItems("visit")는 visit+org), lodging → lodging, 그 외 → detailData

### 주요 상수 (`<script>` 상단 config)
- START_H=6, END_H=24, ROW_H=50(px/시간), SNAP=30(분)
- SAVED_LIST_URL = 구글맵 저장 목록 공유 링크
- MYMAPS_MID = 구글 내 지도 ID(상단 지도 임베드)
- FIREBASE_CONFIG = Firebase 설정(비우면 localStorage 단독 모드), TRIP_ID = "tokyo2026"

## 5. 구글맵 메모
- 개인 "저장 목록"(maps.app.goo.gl)은 iframe 임베드 불가 → 상단은 "내 지도(My Maps)" 임베드로 처리.
- 개별 장소는 `장소명/주소`로 output=embed 임베드(API 키 불필요).

## 6. 배포·협업 흐름
- 편집: `index.html`을 에디터로 수정. 로직은 `<script>`, 스타일은 `<style>`, 초기 예시는 seed 함수.
- 커밋/푸시(폴더에서):
  ```
  git add .
  git commit -m "설명"
  git pull            # 원격에 새 커밋이 있으면 먼저 받기(충돌 시 로컬 우선: git pull -X ours)
  git push
  ```
- 다른 PC: `git clone https://github.com/godsjch-ops/tokyo-trip.git` 후 `index.html` 열기.
- 공유 모드에선 사진은 업로드보다 URL 권장(동기화 속도).
- 보안: [`firebase-rules.json`](firebase-rules.json) = `auth != null` + 메모 500KB 제한. **주찬희가 콘솔에서 익명 인증 On + 규칙 붙여넣기** 해야 켜짐([`연수전_체크리스트.md`](연수전_체크리스트.md) 1번).

## 7. 이어서 할 만한 것
- [x] ~~주찬희: 체크리스트 1번(익명 인증·규칙·첫 세팅)~~ — **완료 확인(2026-09-07)**: 인증 없이 REST 요청 시 `401 Permission denied`, 공유 DB에 실데이터(일정 44 / 후보 15 / 숙소 3) 존재
- [x] ~~폰 2대 현장 테스트~~ — 완료
- [ ] **`firebase-rules.json`을 콘솔에 다시 붙여넣기** (메모 한도 500KB → 1MB)
- [ ] **배포 후 각 폰에서 온라인 1회 접속** — `CACHE`가 v4로 올라가 오프라인 캐시를 새로 만들어야 함
- [ ] 실기기에서 비행기 모드 + 느린 와이파이로 서비스워커 확인 (개발 패널에서는 검증 불가)
- [ ] 기관 사전 조사 자료 완성되면 `OFFICIAL_ORGS`의 `desc`/`purpose`/`points` 교체
- [ ] 연수 후: 익명 인증 계정 정리, 저장소 정리(연락처 등)
- [ ] 하루 총 소요시간·이동시간 합계
- [ ] 참가자 조 편성 표시
- [ ] (검토) 인원 점검 화면 — ROSTER 11명 탭 체크, 인솔자만 노출
- [ ] (검토) 일정 변경 공지 배지 — `memos_meta` 배지와 같은 방식
- [ ] (검토) 오늘의 공유 사진첩 / 기관별 질문 모으기 / 메모→결과보고서 템플릿
