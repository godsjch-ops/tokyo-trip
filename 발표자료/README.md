# 발표자료 — 2026 일본 해외연수 결과 공유 (5분)

> 이 폴더는 `presentation/2026-10` 브랜치에만 있다. 앱(`main`, GitHub Pages 배포)과는 합치지 않는다.

## ★ 실제 발표용: 팀 결과보고 양식 7번 (31~36번 슬라이드)

팀 공용 양식 `2026 따뜻한동행 해외연수 결과보고.pptx`(52장)의 **7. 모금(트러스트뱅크) 및 해외연수app 소개**를 채운 버전(양식 5장 + 1장 추가 = 6장, 전체 53장)이 실제 발표용이다.
양식 파일에는 동료 사진·명단이 있어 **이 공개 저장소에는 올리지 않는다** — 카톡/OneDrive로 주고받을 것. 여기에는 채우는 스크립트만 있다.

| # | 내용 |
|---|---|
| 31 | 트러스트뱅크 기관 개요·방문 개요 + Zoom 회의 사진 + 핵심 수치 |
| 32 | 회의에서 들은 이야기(Q&A 4개, 연수 메모 기준) + 한·일 비교표 |
| 33 | ‘정책 공감형 기부’ 4단계 · 시사점 · 따뜻한동행 적용점(초안) |
| 34 | 해외연수 앱 (폰 시연 영상) + 현장에서 가장 많이 쓴 건 ‘시간표’ |
| 35 | (추가) 실제 화면 — 로그인 · 일정(가장 많이 씀) · SOS 비상 연락처 |
| 36 | 정리 — 이제는 직접 도구를 만들어 업무에 적용할 수 있다 · 하나씩 취미처럼 · 매일 더 쉬워진다 · FOMO 없이 |

다시 채우기 (Windows + PowerPoint, `pip install pywin32`):
```
cd 발표자료/src
python report/fill.py "<양식.pptx>" filled.pptx media "<회의 사진.jpg>"
python report/nobreak_slides.py filled.pptx "<결과.pptx>" 31 32 33 34 35 36
powershell -File report/export.ps1 -In "<결과.pptx>" -OutDir png -Slides "31,32,33,34,35,36"
```
- 문구는 `report/fill.py` 슬라이드별 블록에서 고친다. 글꼴은 양식과 같은 **나눔바른고딕 — 설치돼 있어야 제대로 보인다**.
- ⚠ `fill.py`·`export.ps1`은 PowerPoint를 자동으로 열고 닫는다. 실행 전 열려 있는 PowerPoint 작업은 저장할 것.
- 35번 화면 다시 찍기: 녹화 준비(아래 1~3) 후 `node tools/moments.js stills` → `python tools/moments_compose.py <src 폴더>`
- `nobreak_slides.py`: 양식 기본값이 ‘단어 중간 줄바꿈 허용(latinLnBrk=1)’이라 한글이 단어 중간에서 끊긴다 → 채운 5장만 끈다. 다른 발표자 슬라이드는 건드리지 않음.

## (참고) 단독 덱

- **발표 파일**: [`해외연수_결과공유_도구를만드는시대.pptx`](해외연수_결과공유_도구를만드는시대.pptx) — 10장, 슬라이드 노트에 시간별 대본
- 주제: **이제는 도구를 만들어 쓰는 시대** (트러스트뱅크 방문 2분 → 연수 앱 3분)
- 6번(연수 앱) 슬라이드의 영상은 슬라이드가 열리면 자동 재생·반복. 발표 PC에서 한 번 확인할 것.
- 영상 원본: `src/media/trip-phone.mp4`(폰, 33초)

## 슬라이드 구성

| # | 내용 | 시간 |
|---|---|---|
| 1 | 표지 — 도구를 찾는 시대에서, 만들어 쓰는 시대로 | 0:10 |
| 2 | 트러스트뱅크 — 일본 고향납세를 키운 ‘장(場)’ | 0:40 |
| 3 | 한·일 비교 — 한국 4년차와 일본 19년차 | 0:40 |
| 4 | 연결 — 제도를 키운 건 불편을 직접 푼 ‘도구’ | 0:30 |
| 5 | 문제 — 연수 준비물: PDF 11개, 단체방 1개, 11명 | 0:20 |
| 6 | 연수 앱 소개 (폰 영상) | 0:40 |
| 7 | 핵심 기능 4가지 화면 | 0:30 |
| 8 | 현장에서 배운 것 — 결국 쓰인 건 ‘시간표’ | 0:30 |
| 9 | 마무리 — 익숙한 모양으로 작게, FOMO 없이 | 0:30 |

## 남은 할 일 (2026-10-11 기준)

실제 발표용 = 팀 결과보고 양식 7번(31~36장). 파일은 이 저장소에 없음 → 카톡/OneDrive의 `2026 따뜻한동행 해외연수 결과보고_7번 작성.pptx`.

- [ ] 33번 ‘따뜻한동행 적용점’ 세 줄 — 직접 다듬기 (지금은 초안: 지정기부 공감 테마 / 시공 전후 사진 리포트 / 쇼핑처럼 쉬운 참여 경로)
- [ ] 발표 PC에서 확인: 나눔바른고딕 설치 여부, 34번 영상 자동 재생
- [ ] 노트 대본 시간 배분(총 5분) 소리 내어 한 번 맞춰 보기 — 31 0:45 / 32 0:55 / 33 0:45 / 34 0:55 / 35 0:30 / 36 1:10
- 단독 덱(아래 참고)은 회의 메모 반영 전 버전 — 더 손대지 않음

## 고쳐서 다시 만들기

PowerPoint에서 직접 고쳐도 된다. 스크립트로 다시 만들 때(Windows, Node.js·Python·PowerPoint 필요):

```
cd 발표자료/src
npm install
npm run build                      # build.js → raw.pptx → post.py(테마 색·한글 줄바꿈) → ready.pptx
powershell -File finalize.ps1 -In "%CD%\ready.pptx" -Out "%CD%\..\해외연수_결과공유_도구를만드는시대.pptx" -PngDir "%CD%\png"
```
`finalize.ps1`은 PowerPoint로 열어 영상 자동 재생·반복을 켜고, 슬라이드 PNG(`png/`)를 뽑아 확인용으로 남긴다.

- 문구·배치: `build.js` (슬라이드별 블록, 노트는 `addNotes`)
- 색·글꼴: `theme.json`
- 폰 프레임·정지 화면 합성: `python tools/frames.py <src 폴더>` → `media/phone-*.png`, `phone-frame.png`, `laptop-frame.png`, `geom.json`

## 화면 녹화 다시 하기 (선택)

크롬 헤드리스 + DevTools 프로토콜로 실제 앱을 조작하며 녹화한다. ffmpeg 필요.

1. 녹화용 앱 사본: `python tools/prepare_app.py <저장소 루트> app` — Firebase를 끈 사본이라 **실제 공유 DB에는 접속하지 않는다**. 주소에 `?t=2026-09-16T13:42:00`을 붙이면 그 시각으로 시계 고정.
2. `node tools/serve.js app 8765`
3. 크롬 2개 (폰은 2배 해상도용):
   - `chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<임시폴더1> --hide-scrollbars about:blank`
   - `chrome --headless=new --remote-debugging-port=9334 --user-data-dir=<임시폴더2> --force-device-scale-factor=2 --window-size=390,844 --hide-scrollbars about:blank`
4. 폰 녹화: `PORT=9334 DPR=0 node tools/record.js rec/trip` → `python tools/encode.py rec/trip media/trip-phone.mp4 0.5`
5. 정지 화면: `node tools/stills.js stills`
7. 포스터: `ffmpeg -ss 4.5 -i media/trip-phone.mp4 -frames:v 1 media/trip-poster.png`
