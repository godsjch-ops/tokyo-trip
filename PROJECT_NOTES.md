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
| 편집권한 | 참가자=보기 전용, 관리자=`?edit`+PIN(`EDIT_PIN`, 기본 2918) 1회→기기 기억 |

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
    - 기관(kind:"org") 시트는 길찾기 대신 `o.doc||ORG_DOC_FALLBACK` PDF를 새 창으로 엶(차량 단체 이동이라 길찾기 불필요). `ORG_DOC_FALLBACK`은 현재 해외연수 계획서 PDF(목업). 기관별 사전조사 PDF 준비되면 `OFFICIAL_ORGS`에 `doc:"./파일.pdf"` 추가 + `service-worker.js` ASSETS에 선캐시. 관광(kind:"visit")은 기존 길찾기 유지.
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
2. **오프라인(PWA)**: `manifest.json` + `service-worker.js`(+아이콘 3개 + 해외연수 계획서 PDF 선캐시). 한 번 열면 신호 없이도 열림. HTML은 네트워크 우선, 나머지 캐시 우선, Firebase 실시간·구글지도는 SW가 손대지 않음. 시트 지도는 펼칠 때 로드, 오프라인이면 길찾기 링크로 대체. ASSETS 변경 시 `CACHE` 버전 올릴 것(현재 `tw-tokyo-v2`).
3. **읽기 개선**: 현장 모드 글씨 확대. 기관 시트 = 개요/방문 목적/사전 질문·확인 포인트 구조(`OFFICIAL_ORGS`의 `desc`/`purpose`/`points`). 담당자·홈페이지는 본문에서 제거(홈페이지는 버튼 유지). **purpose/points는 초안** — 사전 조사 자료 나오면 교체 후 관리자가 "PDF 일정표 불러오기" 1회 실행해야 공유 DB에 반영.
4. **숙소 연동**: `lodgingForEvent()`가 stay 일정 블록을 장소/이름으로 숙소 카드에 매칭 → 어디서 열든 `memoId=lodging:<id>`로 통일(메모 공유). 숙소 시트에 "공유 메모로 꿀팁" 안내.
5. **공유 메모 수정**: 내 글은 "수정" → 인라인 서식 편집 → 저장(`edited:true`, "수정됨" 표시).
6. **편집 잠금**: 기본 보기 전용(`body.viewer` → `.editor-only` 숨김). 관리자만 `?edit`+PIN(`EDIT_PIN` 기본 **2918**). 파괴적 함수는 `requireEditor()`로 이중 방어. `?view`로 해제.
7. **메모 UX 재설계**: 시트 = 브리핑 → `.sh-hinge`("여기부터 내 기록") → `.sh-memozone`(스크롤 시 떠오름) → 편집기. `#fmSheetJump` 플로팅 버튼으로 정보↔메모 이동. 편집기는 말풍선 없이 전면(`.memo-editor` 테두리·내부 스크롤 제거, min-height 280). 툴바 `position:sticky`, **B/U/제목(H3)/목록/색상 5종/이미지**. 이미지 = `memoCompressImage`(가로 900px·JPEG 0.55) → `<img data:>` 삽입, 개인·공유 공통. `memoSanitize`가 `IMG[src=data:image]`·`FONT[color=#hex]`·`SPAN[style=color/bg만]`·`H1~3` 허용(그 외 속성 제거 유지).
   - 다음 단계(보류): 기관 브리핑을 관리자 편집 모드에서 앱 내 직접 수정(현재는 `OFFICIAL_ORGS` 코드 상수, 초안 반영 후 전환 예정)
8. **새 글 배지**: 공유 메모가 올라오면 하단 탭(기관·숙소)에 카톡식 빨간 숫자 배지, 해당 기관/숙소 카드 좌상단에 빨간 점. `memos_meta`(count·lastTs) 리스너 + 로컬 `tw_seen_<sheetId>`(마지막으로 본 글 개수) 비교. 시트에서 메모 영역까지 스크롤하면 읽음 처리. 최초 로드 시 이미 있던 글은 읽음 간주(`_memoMetaInit`).
9. **사진 편집기**(`#mie` 오버레이 z90): 업로드하면 바로 넣지 않고 자르기(드래그 크롭 + 비율 자유/1:1/4:3/3:4) + 크기(작게480/보통800/크게1200/원본) 선택 후 캔버스로 재인코딩(JPEG 0.5~0.62). 이미 넣은 사진 탭 → 다시 편집. `memoImgEditOpen/Apply/Close`, `_ie` 상태, `memoCompressImage`는 폴백.

### 저장·공유
- Firebase 실시간 동기화. 헤더에 "실시간 공유 중" 표시.
- 「내보내기/불러오기」: JSON 백업/복원(events·backlog·lodging).

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
  pmemos/<이름or기기>/<sheetId> : { html, ts }             // 개인 메모 2차 백업 (화면엔 본인만)
```
- localStorage 전용: `tw_memodoc_p_<sheetId>`(개인 메모 본문) / `tw_memodoc_pts_<sheetId>`(수정시각) / `tw_memo_pending`(공유 전송 대기열) / `tw_memo_draft_<sheetId>`(공유 작성 중) / `tw_uid`(기기ID) / `tw_editor`(=granted면 편집 가능)
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
- 보안: Firebase DB 규칙이 공개(.read/.write true) — 링크·설정을 아는 사람은 편집 가능. 민감정보 금지. 필요 시 규칙으로 잠글 수 있음.

## 7. 이어서 할 만한 것
- [ ] 배포 후: 관리자가 `?edit`로 열어 **"PDF 일정표 불러오기" 1회** 실행(기관 브리핑 purpose/points 반영)
- [ ] 각 폰에서 온라인일 때 1회 접속(오프라인 캐시 생성). 아이콘은 `logo.png` 아님 → `icon-512.png`만 바꾸면 교체 가능
- [ ] `EDIT_PIN` 값을 원하는 번호로 변경
- [ ] 기관 사전 조사 자료 완성되면 `OFFICIAL_ORGS`의 `desc`/`purpose`/`points` 교체
- [ ] Firebase 규칙 잠금(간단 인증) — 연수 후
- [ ] 삭제 시 확인창 옵션
- [ ] 하루 총 소요시간·이동시간 합계
- [ ] 참가자 9명 조 편성 표시
- [ ] Firebase 규칙 잠금(간단 인증)
