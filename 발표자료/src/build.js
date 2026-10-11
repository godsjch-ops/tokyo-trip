// 따뜻한동행 일본 해외연수 결과 공유 — 트러스트뱅크 + 연수 앱 (5분)
const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');

const M = p => path.join(__dirname, 'media', p);
const LOGO = process.env.LOGO || path.join(__dirname, '..', '..', 'logo.png');
const OUT = process.argv[2];
const G = JSON.parse(fs.readFileSync(M('geom.json'), 'utf8'));

const THEME = JSON.parse(fs.readFileSync(path.join(__dirname, 'theme.json'), 'utf8'));

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pres.title = '도구를 만들어 쓰는 시대 — 일본 해외연수 결과 공유';
pres.author = '주찬희';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const FOOT = '2026 따뜻한동행 일본 해외연수 · 결과 공유';

// ---------- layouts ----------
const footer = (color) => [
  { text: { text: FOOT, options: { x: 0.6, y: 7.02, w: 6, h: 0.3, fontSize: 10, color, margin: 0 } } },
];
const num = (color) => ({ x: 12.25, y: 7.02, w: 0.5, h: 0.3, fontSize: 10, color, align: 'right', margin: 0 });

pres.defineSlideMaster({
  title: 'COVER', background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 2.45, w: 7.4, h: 2.1, fontSize: 46, bold: true, align: 'left', color: C.background1, valign: 'top', margin: 0, lineSpacingMultiple: 1.05 }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'LIGHT', background: { color: C.background1 },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: 0.6, y: 0.42, w: 12.1, h: 0.34, fontSize: 13, bold: true, color: C.accent1, margin: 0, valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.78, w: 12.1, h: 0.8, fontSize: 32, bold: true, align: 'left', color: C.text1, margin: 0, valign: 'middle' }, text: '' } },
    ...footer(C.accent5),
  ],
  slideNumber: num(C.accent5),
});
pres.defineSlideMaster({
  title: 'LIGHT_SPLIT', background: { color: C.background2 },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: 5.2, y: 0.62, w: 7.5, h: 0.34, fontSize: 13, bold: true, color: C.accent1, margin: 0, valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 5.2, y: 0.98, w: 7.5, h: 0.8, fontSize: 32, bold: true, align: 'left', color: C.text1, margin: 0, valign: 'middle' }, text: '' } },
    ...footer(C.accent5),
  ],
  slideNumber: num(C.accent5),
});
pres.defineSlideMaster({
  title: 'DARK', background: { color: C.text2 },
  objects: [
    { placeholder: { options: { name: 'kicker', type: 'body', x: 0.6, y: 0.42, w: 12.1, h: 0.34, fontSize: 13, bold: true, color: C.accent3, margin: 0, valign: 'middle' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.78, w: 12.1, h: 0.8, fontSize: 32, bold: true, align: 'left', color: C.background1, margin: 0, valign: 'middle' }, text: '' } },
    ...footer(C.accent6),
  ],
  slideNumber: num(C.accent6),
});

// ---------- helpers ----------
const T = (s, text, o) => s.addText(text, { isTextBox: true, margin: 0, valign: 'top', ...o });
function card(s, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: o.r ?? 0.14, fill: { color: o.fill ?? C.background1, transparency: o.tr ?? 0 },
    line: o.line ? { color: o.line, width: 0.75 } : { type: 'none' },
    shadow: o.shadow === false ? undefined : { type: 'outer', color: '0F1B2D', opacity: 0.10, blur: 10, offset: 2, angle: 90 },
    objectName: o.name,
  });
}
function dot(s, x, y, d, label, o = {}) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: o.fill ?? C.accent1 }, line: { type: 'none' }, objectName: o.name });
  T(s, label, { x, y, w: d, h: d, align: 'center', valign: 'middle', fontSize: o.size ?? 16, bold: true, color: o.color ?? C.background1 });
}
// Static phone composite (frame + screen baked into one PNG).
function phoneImg(s, file, x, y, h, rot = 0, name) {
  const w = h * G.phone.W / G.phone.H;
  s.addImage({ path: M(file), x, y, w, h, rotate: rot, objectName: name, altText: '연수 앱 화면' });
  return w;
}
// Live phone: video under a frame PNG whose screen is a transparent hole.
function phoneVideo(s, video, poster, x, y, h, name) {
  const k = h / G.phone.H, bleed = 3;
  const w = G.phone.W * k;
  s.addMedia({
    type: 'video', path: M(video), cover: 'data:image/png;base64,' + fs.readFileSync(M(poster)).toString('base64'),
    x: x + (G.phone.hole_x - bleed) * k, y: y + (G.phone.hole_y - bleed) * k,
    w: (G.phone.hole_w + 2 * bleed) * k, h: (G.phone.hole_h + 2 * bleed) * k, objectName: name + ' 영상',
  });
  s.addImage({ path: M('phone-frame.png'), x, y, w, h, objectName: name + ' 프레임', altText: '휴대폰 프레임' });
  return w;
}
function laptopVideo(s, video, poster, x, y, w, name) {
  const k = w / G.laptop.W, bleed = 3;
  const h = G.laptop.H * k;
  s.addMedia({
    type: 'video', path: M(video), cover: 'data:image/png;base64,' + fs.readFileSync(M(poster)).toString('base64'),
    x: x + (G.laptop.hole_x - bleed) * k, y: y + (G.laptop.hole_y - bleed) * k,
    w: (G.laptop.hole_w + 2 * bleed) * k, h: (G.laptop.hole_h + 2 * bleed) * k, objectName: name + ' 영상',
  });
  s.addImage({ path: M('laptop-frame.png'), x, y, w, h, objectName: name + ' 프레임', altText: '노트북 프레임' });
  return h;
}

// =====================================================================
// 1. Cover
pres.addSection({ title: '시작' });
let s = pres.addSlide({ masterName: 'COVER', sectionTitle: '시작' });
card(s, 0.7, 0.62, 2.0, 0.74, { r: 0.37, shadow: false, name: '로고 배경' });
s.addImage({ path: LOGO, x: 1.06, y: 0.69, w: 0.6 * 1602 / 749, h: 0.6, objectName: '따뜻한동행 로고', altText: '따뜻한동행 로고' });
T(s, '2026 따뜻한동행 일본 해외연수 · 결과 공유', { x: 0.7, y: 1.95, w: 7.4, h: 0.4, fontSize: 16, bold: true, color: C.accent3 });
s.addText('도구를 찾는 시대에서,\n만들어 쓰는 시대로', { placeholder: 'title' });
T(s, '트러스트뱅크 방문  ·  연수 앱', { x: 0.7, y: 4.75, w: 7.4, h: 0.45, fontSize: 20, color: C.accent6 });
T(s, '공간복지팀 주찬희  |  2026. 10.', { x: 0.7, y: 6.45, w: 7.4, h: 0.35, fontSize: 14, color: C.accent6 });
phoneImg(s, 'phone-sheet.png', 10.05, 0.72, 5.9, 7, '표지 폰 뒤');
phoneImg(s, 'phone-today.png', 8.45, 0.92, 6.1, -6, '표지 폰 앞');
s.addNotes(`[0:00–0:10] 안녕하세요, 공간복지팀 주찬희입니다. 일본 연수에서 방문한 트러스트뱅크 이야기로 시작해서, 연수를 위해 직접 만든 앱, 그리고 지금 만들고 있는 업무 도구까지 5분 동안 말씀드리겠습니다.`);

// =====================================================================
// 2. Trust Bank — what it is
pres.addSection({ title: '트러스트뱅크 방문' });
s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '트러스트뱅크 방문' });
s.addText('01  트러스트뱅크 방문  ·  2026. 9. 16.(수)', { placeholder: 'kicker' });
s.addText('일본 고향납세를 키운 ‘장(場)’ — 후루사토 초이스', { placeholder: 'title' });
card(s, 0.6, 1.85, 6.55, 4.85, { fill: C.background2, shadow: false, name: '기관 소개 카드' });
T(s, '요코하마 TKP 회의실에서 Zoom 화상회의로 진행', { x: 0.95, y: 2.12, w: 5.9, h: 0.35, fontSize: 14, bold: true, color: C.accent1 });
T(s, [
  { text: '2012년 설립 — 일본 최대 고향납세 종합 플랫폼 ‘후루사토 초이스’ 운영', options: { bullet: true, breakLine: true } },
  { text: '총무성 출신 오이 준 대표가 창업. 지자체와 기부자가 따로따로 만나는 ‘점과 점’으로는 제도가 크지 못한다고 보고, 모두가 만나는 ‘장(플랫폼)’을 만듦', options: { bullet: true, breakLine: true } },
  { text: '2018년 상장사 (주)체인지의 자회사로 편입 → 거버먼트 크라우드펀딩, 지자체 DX 지원, 지역화폐까지 확장', options: { bullet: true } },
], { x: 0.95, y: 2.65, w: 5.9, h: 3.8, fontSize: 17, color: C.text1, paraSpaceAfter: 20, lineSpacingMultiple: 1.2 });
const stats = [
  ['1,700곳+', '이용 지자체 — 일본 전국의 약 95%'],
  ['5,000건+', '거버먼트 크라우드펀딩 누적 프로젝트'],
  ['18억엔', '2016년 구마모토 지진 재해 기부 모금'],
];
stats.forEach(([n, l], i) => {
  const y = 1.85 + i * 1.65;
  card(s, 7.55, y, 5.15, 1.45, { name: '수치 카드 ' + (i + 1) });
  T(s, n, { x: 7.9, y: y + 0.2, w: 4.6, h: 0.65, fontSize: 36, bold: true, color: C.accent1 });
  T(s, l, { x: 7.9, y: y + 0.88, w: 4.6, h: 0.4, fontSize: 15, color: C.accent5 });
});
s.addNotes(`[0:10–0:50] 9월 16일, 요코하마의 회의실에서 트러스트뱅크와 Zoom으로 만났습니다. 트러스트뱅크는 일본 최대 고향납세 플랫폼 '후루사토 초이스'를 운영하는 회사입니다. 일본 지자체의 95%, 1,700곳 이상이 이 플랫폼을 씁니다.
핵심은 창업 배경입니다. 총무성 출신 오이 준 대표는, 지자체와 기부자가 각자 따로 만나는 '점과 점'으로는 제도가 클 수 없다고 봤고, 모두가 한곳에서 만나는 '장', 즉 플랫폼을 직접 만들었습니다.
※ 회의에서 실제로 들은 답변(법인 기부, 수익 구조, NGO 협력 등) 중 인상 깊었던 한 가지를 여기 한 문장 덧붙이세요.`);

// =====================================================================
// 3. Korea vs Japan
s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '트러스트뱅크 방문' });
s.addText('01  트러스트뱅크 방문', { placeholder: 'kicker' });
s.addText('같은 제도, 다른 속도 — 한국 4년차와 일본 19년차', { placeholder: 'title' });
const big = [
  ['한국 고향사랑기부제', '1,515억원', '2025년 · 139.2만 건', C.accent1, 0.6],
  ['일본 후루사토노제(고향납세)', '1조 3,314억엔', '2025년 · 6년 연속 최고 경신', C.accent4, 6.85],
];
big.forEach(([h, n, sub, col, x]) => {
  card(s, x, 1.82, 5.88, 1.62, { name: h + ' 카드' });
  T(s, h, { x: x + 0.35, y: 2.0, w: 5.2, h: 0.35, fontSize: 15, bold: true, color: col });
  T(s, n, { x: x + 0.35, y: 2.36, w: 5.2, h: 0.68, fontSize: 34, bold: true, color: C.text1, valign: 'middle' });
  T(s, sub, { x: x + 0.35, y: 3.04, w: 5.2, h: 0.3, fontSize: 12, color: C.accent5, valign: 'middle' });
});
const hdr = (t, col) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: col }, align: 'center' } });
const cell = (t, o = {}) => ({ text: t, options: { color: C.text1, ...o } });
const rows = [
  [hdr('항목', C.accent5), hdr('한국', C.accent1), hdr('일본', C.accent4)],
  [cell('시행', { bold: true, align: 'center' }), cell('2023년 1월'), cell('2008년')],
  [cell('기부 주체', { bold: true, align: 'center' }), cell('개인만'), cell('개인 + 법인')],
  [cell('연간 한도', { bold: true, align: 'center' }), cell('2,000만원 (소득공제)'), cell('상한 없음 (세액공제)')],
  [cell('플랫폼', { bold: true, align: 'center' }), cell('정부 ‘고향사랑e음’ + 민간 제휴'), cell('40여 개 민간 포털 경쟁 (후루사토 초이스 등)', { bold: true, color: C.accent4 })],
];
s.addTable(rows, {
  x: 0.6, y: 3.72, w: 12.13, colW: [1.9, 5.11, 5.12], rowH: 0.56, fontSize: 15, fontFace: 'Malgun Gothic',
  valign: 'middle', margin: [0, 0.15, 0, 0.15], border: { type: 'solid', color: 'DCE3EC', pt: 0.75 }, fill: { color: C.background1 },
  objectName: '한일 비교표',
});
s.addNotes(`[0:50–1:30] 한국은 이제 4년차, 일본은 19년차입니다. 작년 실적이 한국 1,515억 원, 일본은 1조 3,314억 엔입니다.
차이를 만든 것 중 하나가 마지막 줄입니다. 한국은 정부 플랫폼 중심인데, 일본은 40여 개 민간 플랫폼이 서로 경쟁하면서 기부자가 쓰기 편한 도구를 계속 만들어 왔습니다.`);

// =====================================================================
// 4. Bridge
s = pres.addSlide({ masterName: 'DARK', sectionTitle: '트러스트뱅크 방문' });
s.addText('트러스트뱅크에서 얻은 질문', { placeholder: 'kicker' });
s.addText('제도를 키운 건, 불편을 직접 푼 ‘도구’였습니다', { placeholder: 'title' });
const flow = [
  ['문제', '점과 점의 만남', '지자체와 기부자가\n각자 따로 연결'],
  ['도구', '장(플랫폼)을 만든다', '모두가 한곳에서 만나는\n후루사토 초이스'],
  ['결과', '제도가 자란다', '1,700개 지자체 · 19년\n민간 플랫폼 경쟁'],
];
flow.forEach(([tag, h, d], i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.15, 3.62, 2.9, { fill: C.background1, tr: 90, shadow: false, name: '흐름 ' + (i + 1) });
  dot(s, x + 0.35, 2.45, 0.62, String(i + 1), { fill: i === 1 ? C.accent3 : C.accent1, size: 18 });
  T(s, tag, { x: x + 1.12, y: 2.55, w: 2.2, h: 0.42, fontSize: 14, bold: true, color: C.accent6, valign: 'middle' });
  T(s, h, { x: x + 0.35, y: 3.3, w: 3.0, h: 0.5, fontSize: 22, bold: true, color: C.background1 });
  T(s, d, { x: x + 0.35, y: 3.92, w: 3.0, h: 0.9, fontSize: 15, color: C.accent6, lineSpacingMultiple: 1.15 });
  if (i < 2) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 3.7, y: 3.38, w: 0.4, h: 0.45, fill: { color: C.accent3 }, line: { type: 'none' }, objectName: '화살표 ' + (i + 1) });
});
T(s, '그렇다면, 우리 일의 불편은 누가 풀어야 할까요?', { x: 0.6, y: 5.6, w: 12.1, h: 0.6, fontSize: 24, bold: true, color: C.accent3 });
s.addNotes(`[1:30–2:00] 트러스트뱅크를 보며 든 생각은 이겁니다. 제도를 키운 건 법 조항만이 아니라, 현장의 불편을 정확히 알고 그걸 푸는 도구를 직접 만든 사람이었습니다.
그렇다면 우리 일의 불편은 누가 풀어야 할까요? 저는 연수를 준비하면서 작은 답을 하나 만들어 봤습니다.`);

// =====================================================================
// 5. Problem
pres.addSection({ title: '도구를 만들어 쓰는 시대' });
s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '도구를 만들어 쓰는 시대' });
s.addText('02  도구를 만들어 쓰는 시대', { placeholder: 'kicker' });
s.addText('연수 준비물: PDF 11개, 단체방 1개, 그리고 11명', { placeholder: 'title' });
const scraps = [
  ['📄', '최종 계획서 PDF', '9/3 확정본, 5일 일정표'],
  ['🏛️', '기관 자료 PDF 9개', '사전조사 · 질문 자료'],
  ['📕', '연수 핸드북 PDF', '전체 안내 자료'],
  ['📍', '구글맵 장소 링크', '기관 · 숙소 · 식당'],
  ['💬', '단체방 공지', '일정 변경 · 집결 시각'],
  ['🆘', '비상 연락처', '영사콜센터 · 숙소 · 인솔진'],
];
scraps.forEach(([ic, h, d], i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.6 + col * 3.55, y = 1.95 + row * 1.5;
  card(s, x, y, 3.3, 1.25, { name: '흩어진 자료 ' + (i + 1) });
  T(s, ic, { x: x + 0.22, y: y + 0.3, w: 0.6, h: 0.6, fontSize: 24, align: 'center', valign: 'middle' });
  T(s, h, { x: x + 0.95, y: y + 0.24, w: 2.25, h: 0.42, fontSize: 15, bold: true, color: C.text1 });
  T(s, d, { x: x + 0.95, y: y + 0.68, w: 2.25, h: 0.35, fontSize: 12, color: C.accent5 });
});
s.addShape(pres.shapes.RIGHT_ARROW, { x: 7.75, y: 3.75, w: 0.75, h: 0.7, fill: { color: C.accent3 }, line: { type: 'none' }, objectName: '모으기 화살표' });
phoneImg(s, 'phone-today.png', 8.75, 1.8, 4.6, 0, '링크 하나 폰');
T(s, [
  { text: '링크 하나', options: { bold: true, color: C.accent1, fontSize: 22, breakLine: true } },
  { text: '현장에 필요한 건\n지금, 다음,\n그리고 이 기관', options: { color: C.text1, fontSize: 15 } },
], { x: 10.95, y: 2.75, w: 1.95, h: 2.2, valign: 'top', lineSpacingMultiple: 1.2 });
T(s, '정보는 흩어져 있고, 버스 안·기관 앞에서 찾아볼 시간은 없습니다.', { x: 0.6, y: 6.5, w: 7.0, h: 0.4, fontSize: 15, bold: true, color: C.accent5 });
s.addNotes(`[2:00–2:20] 연수를 준비하니 자료가 이렇게 흩어져 있었습니다. 계획서, 기관별 자료 9개, 핸드북, 지도 링크, 단체방 공지, 비상 연락처. 11명이 버스 안에서, 기관 앞에서 이걸 다 찾아볼 수는 없습니다. 그래서 링크 하나로 모았습니다.`);

// =====================================================================
// 6. App intro (live phone)
s = pres.addSlide({ masterName: 'LIGHT_SPLIT', sectionTitle: '도구를 만들어 쓰는 시대' });
s.addText('02  연수 앱 소개', { placeholder: 'kicker' });
s.addText('그래서 만들었습니다 — 연수 전용 앱', { placeholder: 'title' });
phoneVideo(s, 'trip-phone.mp4', 'trip-poster.png', 1.25, 0.5, 6.35, '연수 앱 시연');
T(s, '링크 하나로 여는, 11명 실시간 공유 일정 앱', { x: 5.2, y: 1.9, w: 7.5, h: 0.45, fontSize: 19, color: C.accent5 });
const feats = [
  ['🔗', '설치 없이 링크 하나', '웹 주소를 홈 화면에 추가 · 첫 화면에서 이름만 입력하면 입장'],
  ['⚡', '실시간 공유', '관리자가 일정을 고치면 11명 화면에 바로 반영'],
  ['📴', '오프라인 대비', '한 번 열어 두면 지하·기내에서도 일정과 기관 자료 열람'],
  ['🤖', 'AI와 함께 직접 개발', 'HTML 파일 하나로 만들고 GitHub Pages로 배포'],
];
feats.forEach(([ic, h, d], i) => {
  const y = 2.6 + i * 0.86;
  s.addShape(pres.shapes.OVAL, { x: 5.2, y, w: 0.62, h: 0.62, fill: { color: C.background1 }, line: { color: 'DCE3EC', width: 0.75 }, objectName: '아이콘 원 ' + (i + 1) });
  T(s, ic, { x: 5.2, y, w: 0.62, h: 0.62, fontSize: 18, align: 'center', valign: 'middle' });
  T(s, h, { x: 6.05, y: y - 0.02, w: 6.6, h: 0.36, fontSize: 17, bold: true, color: C.text1 });
  T(s, d, { x: 6.05, y: y + 0.34, w: 6.6, h: 0.32, fontSize: 13, color: C.accent5 });
});
const nums = [['11', '명'], ['5', '일'], ['9', '개 기관'], ['44', '개 일정']];
card(s, 5.2, 6.05, 7.5, 0.8, { name: '숫자 띠' });
nums.forEach(([n, u], i) => {
  T(s, [{ text: n, options: { fontSize: 26, bold: true, color: C.accent1 } }, { text: ' ' + u, options: { fontSize: 14, color: C.accent5 } }],
    { x: 5.35 + i * 1.85, y: 6.1, w: 1.8, h: 0.7, align: 'center', valign: 'middle' });
});
s.addNotes(`[2:20–3:00] (영상이 자동으로 재생됩니다) 이름을 넣고 들어가면, 오늘 날짜의 일정이 바로 뜹니다. 지금 화면은 9월 16일, 트러스트뱅크 회의 시간입니다 — '지금 진행 중', 남은 시간, 다음 일정이 한눈에 보입니다. 옆으로 밀면 다음 날로 넘어가고, '기관 정보 보기'를 누르면 기관 브리핑이 올라옵니다.
설치는 없습니다. 링크 하나를 홈 화면에 추가하면 끝이고, 제가 일정을 고치면 11명 화면에 바로 바뀝니다. 이 앱은 AI와 대화하면서 제가 직접 만들었습니다.`);

// =====================================================================
// 7. Core features (4 phones)
s = pres.addSlide({ masterName: 'LIGHT', sectionTitle: '도구를 만들어 쓰는 시대' });
s.addText('02  핵심 기능', { placeholder: 'kicker' });
s.addText('‘폰을 꺼내는 순간’에 맞춘 네 가지 화면', { placeholder: 'title' });
const four = [
  ['phone-today.png', '오늘', '지금 진행 중 · 남은 시간 · 다음 일정\n좌우로 밀어 날짜 이동'],
  ['phone-sheet.png', '기관 브리핑', '개요 · 방문 목적 · 사전 질문\n기관별 사전조사 PDF 바로 열기'],
  ['phone-memo.png', '메모', '개인 메모 30초 자동 저장\n공유 메모로 11명 기록 모으기'],
  ['phone-sos.png', '비상 연락처', '오늘 밤 숙소 · 영사콜센터 · 110/119\n누르면 바로 전화'],
];
four.forEach(([f, h, d], i) => {
  const cx = 0.6 + i * 3.08 + 1.43;
  const ph = 3.95, pw = ph * G.phone.W / G.phone.H;
  phoneImg(s, f, cx - pw / 2, 1.8, ph, 0, h + ' 화면');
  dot(s, 0.6 + i * 3.08 + 0.05, 5.95, 0.42, String(i + 1), { size: 14 });
  T(s, h, { x: 0.6 + i * 3.08 + 0.58, y: 5.95, w: 2.3, h: 0.42, fontSize: 17, bold: true, color: C.text1, valign: 'middle' });
  T(s, d, { x: 0.6 + i * 3.08 + 0.05, y: 6.42, w: 2.9, h: 0.55, fontSize: 11.5, color: C.accent5, lineSpacingMultiple: 1.1 });
});
s.addNotes(`[3:00–3:30] 화면은 네 가지입니다. 오늘 일정, 기관 브리핑, 메모, 비상 연락처. 기준은 하나였습니다 — 버스 안에서, 기관 앞에서 폰을 꺼냈을 때 3초 안에 답이 나오는가.`);

// =====================================================================
// 8. What we actually used in the field
s = pres.addSlide({ masterName: 'DARK', sectionTitle: '도구를 만들어 쓰는 시대' });
s.addText('02  현장에서 배운 것', { placeholder: 'kicker' });
s.addText('결국 가장 많이 쓰인 건 ‘시간표’였습니다', { placeholder: 'title' });
phoneImg(s, 'phone-today.png', 1.15, 1.75, 5.05, 0, '현장 기능 폰');
const used = [
  ['모두 · 매일', '‘지금 진행 중’ 카드와 다음 일정', '시간표처럼 “다음에 어디 가지?”를 확인하는 데 가장 많이 썼습니다', C.accent3, C.text2],
  ['급할 때 · 나만', '메모', '급할 때 잠깐 쓰거나, 사실상 저 혼자 썼습니다', C.accent6, C.text2],
  ['생각보다 적게', '익숙하지 않은 기능', '좋아 보이는 새 방식도, 현장에서는 생각보다 잘 쓰이지 않았습니다', C.accent5, C.background1],
];
used.forEach(([tag, h, d, fill, tc], i) => {
  const y = 1.95 + i * 1.3;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4.45, y: y + 0.04, w: 1.75, h: 0.44, rectRadius: 0.22, fill: { color: fill }, line: { type: 'none' }, objectName: '사용 빈도 ' + (i + 1) });
  T(s, tag, { x: 4.45, y: y + 0.04, w: 1.75, h: 0.44, fontSize: 13, bold: true, color: tc, align: 'center', valign: 'middle' });
  T(s, h, { x: 6.5, y, w: 6.2, h: 0.5, fontSize: 21, bold: true, color: C.background1, valign: 'middle' });
  T(s, d, { x: 6.5, y: y + 0.55, w: 6.2, h: 0.5, fontSize: 15, color: C.accent6 });
});
s.addShape(pres.shapes.LINE, { x: 4.45, y: 5.85, w: 8.25, h: 0, line: { color: C.accent5, width: 0.75 }, objectName: '구분선' });
T(s, '사람들은 새 기능이 아니라, 이미 익숙한 모양으로 도구를 씁니다', { x: 4.45, y: 6.05, w: 8.25, h: 0.5, fontSize: 19, bold: true, color: C.accent3, valign: 'middle' });
s.addNotes(`[3:30–4:00] 현장에서 실제로 가장 많이 쓴 건 '지금 진행 중' 카드였습니다. 다들 시간표처럼, 다음에 어디 가는지를 확인하는 데 썼습니다.
반면 메모는 급할 때만 쓰거나, 사실상 저 혼자 썼습니다. 만들면서 기대했던 기능 중에서도 익숙하지 않은 건 생각보다 잘 쓰이지 않았습니다.
결국 사람들이 쓴 건 이미 익숙한 모양, 시간표였습니다.`);

// =====================================================================
// 10. Closing
pres.addSection({ title: '마무리' });
s = pres.addSlide({ masterName: 'DARK', sectionTitle: '마무리' });
s.addText('마무리', { placeholder: 'kicker' });
s.addText('이제는 도구를 ‘만들어 쓰는’ 시대입니다', { placeholder: 'title' });
const take = [
  ['불편을 가장 잘 아는 사람이 만든다', '문제를 정의하는 건 현장 담당자. 코드는 AI와 함께 쓸 수 있습니다.'],
  ['익숙한 모양으로, 작게', '현장에서 쓰인 건 새 기능이 아니라 익숙한 시간표였습니다.'],
  ['FOMO를 느끼지 않아도 좋다', '세상은 바뀔 수 있지만, 그렇게 쉽게 바뀌지는 않습니다.'],
];
take.forEach(([h, d], i) => {
  const x = 0.6 + i * 4.18;
  card(s, x, 2.0, 3.85, 3.0, { fill: C.background1, tr: 90, shadow: false, name: '정리 ' + (i + 1) });
  dot(s, x + 0.35, 2.3, 0.62, String(i + 1), { fill: C.accent3, size: 18 });
  T(s, h, { x: x + 0.35, y: 3.15, w: 3.2, h: 0.85, fontSize: 19, bold: true, color: C.background1, lineSpacingMultiple: 1.1 });
  T(s, d, { x: x + 0.35, y: 4.05, w: 3.2, h: 0.8, fontSize: 14, color: C.accent6, lineSpacingMultiple: 1.15 });
});
T(s, '일본 고향납세도 19년에 걸쳐 자랐습니다. 서두르지 말고, 내 일의 불편 하나부터.', { x: 0.6, y: 5.45, w: 12.1, h: 0.5, fontSize: 17, color: C.accent6 });
T(s, '감사합니다', { x: 0.6, y: 6.0, w: 12.1, h: 0.7, fontSize: 30, bold: true, color: C.accent3 });
s.addNotes(`[4:30–5:00] 정리하겠습니다. 이제는 불편을 가장 잘 아는 사람이 직접 도구를 만들 수 있는 시대입니다. 다만 현장에서 배운 건, 쓰이는 도구는 익숙한 모양이라는 것, 그리고 세상은 바뀔 수 있지만 그렇게 쉽게 바뀌지는 않는다는 것입니다.
그러니 새 도구나 AI를 보면서 FOMO를 느끼지 않아도 괜찮습니다. 일본 고향납세도 19년에 걸쳐 자랐습니다. 서두르지 말고, 내 일의 불편 하나부터 작게 만들어 보면 됩니다. 감사합니다.`);

(async () => {
  await pres.writeFile({ fileName: OUT });
  console.log('wrote', OUT);
})();
