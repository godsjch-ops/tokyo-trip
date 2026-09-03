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
| 모바일 | 요일 탭으로 하루씩 전체 화면 |

## 3. 현재 기능
### 일정표(주간 그리드)
- 5일 × 06~24시, 카테고리 색상(방문/식사/이동/숙소/회의·연수/자유).
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
- 하단 탭 5개: **오늘 / 기관 / 숙소 / 식당 / 전체**. (전체 = 현장 모드 종료 후 주간 그리드로 스크롤)
  - 오늘: `computeTodayIdx()`로 오늘 필터. 여행 전이면 D-day + 날짜 셀렉터. 여행중이면 "지금 진행 중/다음" 카드 + 타임라인(지난 건 흐리게). `ref` 있는 일정엔 "기관 정보" 버튼.
  - 기관: `backlog`의 `kind:"org"` 9곳 카드 → 시트(정보 + 공식 홈페이지 + 지도 + 길찾기 + 메모). 아래 관광(kind:"visit")도 표시.
  - 숙소: `lodging` 카드, 오늘 밤 숙소 강조(`fmPeriodCoversDay`). 시트에 지도 + 메모.
  - 식당: `kind:"food"` 없으면 "준비 중" 안내 + 일정표 meal 블록 목록.
- **메모** (기관/숙소/일정 시트 공용):
  - 개인 = `localStorage` 키 `tw_memo_p_<sheetId>` (이 기기에만).
  - 공유 = Firebase `trips/tokyo2026/memos/<sheetId>` — **항목 단위 `push()`** (동시편집 안전). fbdb 없으면 `tw_memo_s_<sheetId>` 폴백. 작성자명 `localStorage.tw_name`.
  - sheetId 예: `org:org-5`, `lodging:lg-2`, `event:o-2-0950`.
- 헤더 「📋 PDF 일정표 불러오기」= `loadOfficialItinerary()`: JSON 백업 자동저장 → 확인 → `events`/`backlog`(org·spot)/`lodging`을 PDF 확정본으로 **전면 교체**(kind:"food"·메모는 보존). 상수: `OFFICIAL_ORGS / OFFICIAL_SPOTS / OFFICIAL_LODGING / DAY_MEALS / buildOfficialEvents()`.

### 저장·공유
- Firebase 실시간 동기화. 헤더에 "실시간 공유 중" 표시.
- 「📤 기기데이터 올리기」: 이 기기 localStorage 데이터를 공유 저장소로 1회 업로드(마이그레이션용).
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
  memos/<sheetId>/<pushId> : { name, text, ts }   // 현장 모드 공유 메모 (항목 단위 push)
```
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
- [ ] 삭제 시 확인창 옵션
- [ ] 하루 총 소요시간·이동시간 합계
- [ ] 참가자 9명 조 편성 표시
- [ ] Firebase 규칙 잠금(간단 인증)
