"""결과보고 양식(52장) 중 7번 '모금(트러스트뱅크) 및 해외연수app 소개' 31~35번을 PowerPoint로 채운다.
사용: python fill.py <양식.pptx> <출력.pptx> <미디어 폴더> <회의 사진.jpg> [png 폴더]
"""
import json, os, sys
import pythoncom
import win32com.client

def pget(obj, name, *args):
    """Parameterized property get (e.g. TextRange2.Paragraphs(i, 1)) — late binding can't call these directly."""
    o = obj._oleobj_
    r = o.Invoke(o.GetIDsOfNames(name), 0, pythoncom.DISPATCH_PROPERTYGET, True, *args)
    return win32com.client.Dispatch(r)

def pput(obj, name, *args):
    o = obj._oleobj_
    o.Invoke(o.GetIDsOfNames(name), 0, pythoncom.DISPATCH_PROPERTYPUT, False, *args)

SRC, OUT, MEDIA, PHOTO = [os.path.abspath(a) for a in sys.argv[1:5]]
PNG = os.path.abspath(sys.argv[5]) if len(sys.argv) > 5 else None
G = json.load(open(os.path.join(MEDIA, 'geom.json'), encoding='utf-8'))
FONT = '나눔바른고딕'
DARK, BLUE, MUTED, LIGHT, LINE = '262626', '0070C0', '595959', 'EEF5FB', 'BFD4E8'
WHITE = 'FFFFFF'

def rgb(h):  # COM wants BGR
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return r + g * 256 + b * 65536

def style_range(r, size, bold=False, color=DARK):
    r.Font.Name = FONT; r.Font.NameFarEast = FONT
    r.Font.Size = size; r.Font.Bold = -1 if bold else 0
    r.Font.Fill.ForeColor.RGB = rgb(color)
    r.LanguageID = 1042

def text(sl, x, y, w, h, paras, name=None, valign=1):
    """paras: [{'t': str | [(str, {bold,color})...], 'size', 'bold', 'color', 'indent', 'hang', 'before', 'after', 'align'}]"""
    shp = sl.Shapes.AddTextbox(1, x, y, w, h)
    if name: shp.Name = name
    tf = shp.TextFrame2
    tf.AutoSize = 0; tf.WordWrap = -1; tf.VerticalAnchor = valign
    tf.MarginLeft = tf.MarginRight = tf.MarginTop = tf.MarginBottom = 0
    plain = []
    for p in paras:
        t = p['t']; plain.append(t if isinstance(t, str) else ''.join(s for s, _ in t))
    tf.TextRange.Text = '\r'.join(plain)
    for i, p in enumerate(paras, 1):
        pr = pget(tf.TextRange, 'Paragraphs', i, 1)
        style_range(pr, p.get('size', 14), p.get('bold', False), p.get('color', DARK))
        pf = pr.ParagraphFormat
        pf.WordWrap = 0  # 한글 단어 중간에서 끊지 않기
        pf.Alignment = p.get('align', 1)
        pf.LeftIndent = p.get('indent', 0) + p.get('hang', 0)
        pf.FirstLineIndent = -p.get('hang', 0)
        pf.SpaceBefore = p.get('before', 0); pf.SpaceAfter = p.get('after', 0)
        pf.SpaceWithin = p.get('line', 1.1)
        if not isinstance(p['t'], str):
            pos = 1
            for s, o in p['t']:
                if s and o:
                    style_range(pget(pr, 'Characters', pos, len(s)), o.get('size', p.get('size', 14)), o.get('bold', p.get('bold', False)), o.get('color', p.get('color', DARK)))
                pos += len(s)
    return shp

def box(sl, x, y, w, h, fill=LIGHT, line=None, r=0.12, name=None):
    shp = sl.Shapes.AddShape(5, x, y, w, h)
    if name: shp.Name = name
    pput(shp.Adjustments, 'Item', 1, r)
    if fill: shp.Fill.ForeColor.RGB = rgb(fill); shp.Fill.Solid()
    else: shp.Fill.Visible = 0
    if line: shp.Line.ForeColor.RGB = rgb(line); shp.Line.Weight = 1
    else: shp.Line.Visible = 0
    shp.Shadow.Visible = 0
    shp.TextFrame2.TextRange.Text = ''
    return shp

def pill(sl, x, y, w, h, label, fill, color, size=12, name=None):
    b = box(sl, x, y, w, h, fill=fill, r=0.5, name=name)
    tr = b.TextFrame2.TextRange; tr.Text = label
    style_range(tr, size, True, color); tr.ParagraphFormat.Alignment = 2; tr.ParagraphFormat.WordWrap = 0
    tf = b.TextFrame2; tf.MarginLeft = tf.MarginRight = tf.MarginTop = tf.MarginBottom = 0; tf.VerticalAnchor = 3
    return b

def callout(sl, x, y, w, h, t, size=17, name=None):
    b = box(sl, x, y, w, h, fill=WHITE, line=BLUE, r=0.08, name=name)
    tr = b.TextFrame2.TextRange; tr.Text = t
    style_range(tr, size, True, BLUE); tr.ParagraphFormat.Alignment = 2; tr.ParagraphFormat.WordWrap = 0
    tf = b.TextFrame2; tf.VerticalAnchor = 3; tf.MarginLeft = tf.MarginRight = 10
    return b

def set_title(sl, t):
    for shp in sl.Shapes:
        if shp.HasTextFrame and shp.TextFrame.TextRange.Text.strip().startswith('7.'):
            shp.TextFrame.TextRange.Text = t
            return
    raise RuntimeError('title not found on slide %d' % sl.SlideIndex)

def autoplay(sl, shp):
    ps = shp.AnimationSettings.PlaySettings
    ps.PlayOnEntry = -1; ps.LoopUntilStopped = -1; ps.HideWhileNotPlaying = 0; ps.RewindMovie = -1
    seq = sl.TimeLine.MainSequence
    for i in range(1, seq.Count + 1):
        e = seq.Item(i)
        if e.Shape.Name == shp.Name: e.Timing.TriggerType = 2

def device_video(sl, kind, video, poster, x, y, size, name):
    g = G[kind]; frame = os.path.join(MEDIA, 'phone-frame.png' if kind == 'phone' else 'laptop-frame.png')
    k = (size / g['H']) if kind == 'phone' else (size / g['W'])
    w, h = g['W'] * k, g['H'] * k; bleed = 3
    v = sl.Shapes.AddMediaObject2(os.path.join(MEDIA, video), 0, -1,
                                  x + (g['hole_x'] - bleed) * k, y + (g['hole_y'] - bleed) * k,
                                  (g['hole_w'] + 2 * bleed) * k, (g['hole_h'] + 2 * bleed) * k)
    v.Name = name + ' 영상'
    v.MediaFormat.SetDisplayPictureFromFile(os.path.join(MEDIA, poster))
    f = sl.Shapes.AddPicture(frame, 0, -1, x, y, w, h); f.Name = name + ' 프레임'
    autoplay(sl, v)
    return w, h

def notes(sl, t):
    sl.NotesPage.Shapes.Placeholders(2).TextFrame.TextRange.Text = t

H = lambda t, **k: {'t': t, 'size': 20, 'bold': True, **k}            # ○ 소제목
B = lambda t, **k: {'t': t, 'size': 14, 'hang': 12, 'indent': 10, **k}  # • 항목

app = win32com.client.Dispatch('PowerPoint.Application')
pres = app.Presentations.Open(SRC, 0, 0, 0)
try:
    S = lambda n: pres.Slides.Item(n)
    pres.Slides.Item(35).Duplicate()  # 7번에 한 장 추가: 새 35(연수 기간 화면), 기존 35 → 36

    # ---------------- 31. 트러스트뱅크 개요 + 회의 사진 ----------------
    sl = S(31); set_title(sl, '7. 모금 _ 트러스트뱅크')
    text(sl, 50, 84, 505, 330, [
        H('○ 기관 개요'),
        {'t': '일본 최대 고향납세 종합 플랫폼 ‘후루사토 초이스’를 운영하는 기업 (2012년 설립)', 'size': 15, 'indent': 22, 'before': 6, 'after': 6},
        B('•대    표 : 오이 준 — 총무성 출신, 고향납세 제도를 맡았던 부처 경험'),
        B('•창업 계기 : 지자체와 기부자가 따로 만나는 ‘점과 점’으로는 제도가 크지 못한다고 보고, 모두가 만나는 ‘장(플랫폼)’을 만듦', before=3),
        B('•규    모 : 일본 전국 지자체의 약 95%(1,700곳 이상)가 이용, 2018년 상장사 (주)체인지의 자회사로 편입', before=3),
        B('•주요 사업 : 고향납세(개인·기업), 거버먼트 크라우드펀딩, 지자체 DX, 지역화폐', before=3),
        H('○ 방문 개요', before=16),
        B('•일    시 : 2026. 9. 16.(수) 14:00~15:00', before=6),
        B('•방    식 : 요코하마 TKP 가든시티 회의실에서 Zoom 화상회의 (연수단 11명)', before=3),
    ], name='트러스트뱅크 개요')
    callout(sl, 50, 432, 505, 50, '‘점과 점’이 아니라, 모두가 만나는 ‘장(場)’을 만든다', size=17, name='핵심 문장')
    ph = sl.Shapes.AddPicture(PHOTO, 0, -1, 578, 86, 344, 258); ph.Name = 'Zoom 회의 사진'
    text(sl, 578, 350, 344, 20, [{'t': '트러스트뱅크와 Zoom 화상회의 (2026. 9. 16. 요코하마)', 'size': 11, 'color': MUTED, 'align': 2}], name='사진 설명')
    for i, (n, l) in enumerate([('1,700곳+', '이용 지자체'), ('5,000건+', '크라우드펀딩 누적'), ('18억엔', '구마모토 지진 모금')]):
        bx = 578 + i * 118
        box(sl, bx, 382, 108, 100, fill=LIGHT, name='수치 ' + str(i + 1))
        text(sl, bx, 400, 108, 34, [{'t': n, 'size': 19, 'bold': True, 'color': BLUE, 'align': 2}])
        text(sl, bx + 4, 440, 100, 30, [{'t': l, 'size': 11, 'color': MUTED, 'align': 2}])
    notes(sl, '[0:00–0:45] 9월 16일 요코하마 회의실에서 트러스트뱅크와 Zoom으로 만났습니다. 트러스트뱅크는 일본 최대 고향납세 플랫폼 ‘후루사토 초이스’를 운영하고, 일본 지자체의 95%, 1,700곳 이상이 이 플랫폼을 씁니다.\n'
                 '창업 배경이 인상적이었습니다. 총무성 출신 오이 준 대표는 지자체와 기부자가 따로따로 만나는 ‘점과 점’으로는 제도가 클 수 없다고 보고, 모두가 한곳에서 만나는 ‘장’, 즉 플랫폼을 직접 만들었습니다.')

    # ---------------- 32. 질의응답 + 한일 비교 ----------------
    sl = S(32); set_title(sl, '7. 모금 _ 트러스트뱅크')
    Q = lambda t: {'t': t, 'size': 16, 'bold': True, 'color': BLUE, 'before': 13, 'after': 4}
    A = lambda t: {'t': t, 'size': 15, 'indent': 18, 'line': 1.15}
    text(sl, 50, 84, 520, 420, [
        H('○ 회의에서 들은 이야기'),
        Q('Q. 어떻게 1등이 되었나?'),
        A('고향납세 포털사이트를 가장 먼저 만들었다. 뒤이어 대형 포털이 들어왔지만 참여 지자체·상품 수, 한정상품 개발, 지자체 맞춤형 지원으로 1위를 지킨다.'),
        Q('Q. 법인 기부는 처음부터 가능했나?'),
        A('2016년부터 가능해졌다. 세수가 적은 지방이 직접 재원을 확보하도록 정책으로 열었다. (예: 아키타현 — 땅은 넓은데 큰 기업이 없어 도로·공공시설 보수 재원이 부족)'),
        Q('Q. 고향납세 때문에 일반 기부가 줄었다는 비판은?'),
        A('고향납세와 일반 기부를 나누지 말고, ‘기부의 또 다른 종류’로 봐 주면 좋겠다.'),
        Q('Q. 한국 고향사랑기부제를 평가한다면?'),
        A('아직 금액이 작고 이제 시작이다. 일본이 커진 건 고향을 사랑해서라기보다 쇼핑몰처럼 쉽게 쓸 수 있었기 때문 — 한국은 정부가 조건을 손봐야 한다.'),
    ], name='질의응답')
    text(sl, 598, 84, 324, 30, [H('○ 한·일 비교')], name='비교 제목')
    rows = [('항목', '한국', '일본'), ('시행', '2023년', '2008년'), ('기부 주체', '개인', '개인 + 법인(2016~)'),
            ('2025 실적', '1,515억원', '1조 3,314억엔'), ('플랫폼', '고향사랑e음 + 민간 제휴', '민간 포털 40여 개 경쟁')]
    tshp = sl.Shapes.AddTable(len(rows), 3, 598, 124, 324, 230); tshp.Name = '한일 비교표'
    tbl = tshp.Table
    tbl.ApplyStyle('{5940675A-B579-460E-94D1-54222C63F5DA}', False)  # No Style, Table Grid
    for c, wdt in enumerate((74, 110, 140), 1): tbl.Columns(c).Width = wdt
    for r, row in enumerate(rows, 1):
        for c, val in enumerate(row, 1):
            cell = tbl.Cell(r, c); s = cell.Shape
            tr = s.TextFrame2.TextRange; tr.Text = val
            head = r == 1
            style_range(tr, 12.5, head or c == 1, WHITE if head else (BLUE if (r == 4 and c > 1) else DARK))
            if r == 4 and c > 1: tr.Font.Bold = -1
            tr.ParagraphFormat.Alignment = 2; tr.ParagraphFormat.WordWrap = 0
            s.TextFrame2.VerticalAnchor = 3
            s.TextFrame2.MarginLeft = s.TextFrame2.MarginRight = 5
            s.Fill.ForeColor.RGB = rgb(BLUE if head else (LIGHT if c == 1 else WHITE)); s.Fill.Solid()
            for bdr in (1, 2, 3, 4):
                cell.Borders(bdr).ForeColor.RGB = rgb(LINE); cell.Borders(bdr).Weight = 0.75
    for r in range(1, len(rows) + 1): tbl.Rows(r).Height = 46
    callout(sl, 598, 400, 324, 90, '일본 고향납세가 커진 이유\n‘고향 사랑’보다 ‘쇼핑몰처럼 쉬운’ 기부', size=16, name='핵심 문장')
    notes(sl, '[0:45–1:40] 회의에서 들은 이야기 네 가지입니다.\n'
                 '어떻게 1등이 됐냐고 물었더니, 포털사이트를 가장 먼저 만들었기 때문이라고 했습니다. 법인 기부는 2016년부터 열렸는데, 아키타현처럼 땅은 넓고 세수는 적은 지방이 직접 재원을 마련하게 하려는 정책이었습니다.\n'
                 '그리고 가장 기억에 남는 답 — 한국 제도를 평가해 달라고 하자, 일본이 커진 건 고향을 사랑해서라기보다 쇼핑몰처럼 쉽게 쓸 수 있었기 때문이라고 했습니다. 제도를 키운 건 결국 ‘쉬운 도구’였다는 겁니다.')

    # ---------------- 33. 정책 공감형 기부 · 시사점 · 적용점 ----------------
    sl = S(33); set_title(sl, '7. 모금 _ 트러스트뱅크')
    text(sl, 50, 84, 870, 30, [H('○ 트러스트뱅크가 지향하는 모델 — ‘정책 공감형 기부’')], name='모델 제목')
    steps = [('01', '정책 목표 제시', '지자체가 해결할 문제를 공개'), ('02', '공감한 기부', '목표에 공감한 사람이 기부'),
             ('03', '필요시 답례', '답례품은 선택'), ('04', '진행 리포트', '결과를 빨리 알려 줌')]
    for i, (n, h, d) in enumerate(steps):
        bx = 50 + i * 222
        box(sl, bx, 124, 196, 92, fill=LIGHT, name='단계 ' + n)
        text(sl, bx + 16, 136, 170, 20, [{'t': n, 'size': 13, 'bold': True, 'color': BLUE}])
        text(sl, bx + 16, 156, 170, 26, [{'t': h, 'size': 17, 'bold': True}])
        text(sl, bx + 16, 186, 170, 22, [{'t': d, 'size': 12, 'color': MUTED}])
        if i < 3:
            a = sl.Shapes.AddShape(33, bx + 200, 160, 18, 20); a.Fill.ForeColor.RGB = rgb(BLUE); a.Line.Visible = 0; a.Name = '화살표 ' + n
    text(sl, 50, 236, 870, 290, [
        H('○ 시사점'),
        B('•기부가 모이는 건 ‘테마’ — 빈곤아동, 문화유적, 반려동물 (예: 유기견 보호 크라우드펀딩에 3~5억엔)', before=6, size=15),
        B('•결국 기부이므로 결과를 빨리 알려 준다 — 그래서 사회공헌 마인드가 강한 기부자가 모인다', before=4, size=15),
        B('•한 줄 정리 : 사랑의열매·해피빈의 ‘지방정부 버전’, ‘특산물 버전’', before=4, size=15),
        H('○ 따뜻한동행 적용점', before=24),
        B('•고향사랑기부제 지정기부에 우리 사업을 ‘공감 테마’로 제안 — 주거취약가구 집수리, 장애인 주거편의 개선', before=6, size=15),
        B('•기부자에게 빠른 결과 리포트 — 시공 전·후 사진 보고를 정례화', before=4, size=15),
        B('•쉬운 참여 경로 — 기부·후원도 ‘쇼핑처럼’ 익숙한 화면에서 끝나게', before=4, size=15),
    ], name='시사점 및 적용점')
    notes(sl, '[1:40–2:25] 트러스트뱅크가 지향하는 건 ‘정책 공감형 기부’입니다. 지자체가 정책 목표를 내걸고, 공감한 사람이 기부하고, 답례는 필요할 때만, 그리고 진행 결과를 빨리 알려 줍니다.\n'
                 '시사점은 두 가지입니다. 기부가 모이는 건 테마, 그리고 빠른 피드백.\n'
                 '※ 따뜻한동행 적용점은 초안입니다 — 팀 논의에 맞게 다듬어 주세요.\n'
                 '저희도 집수리·주거편의 같은 사업을 지정기부의 공감 테마로 제안하고, 시공 전후 사진으로 빨리 보고하면 됩니다. 그리고 참여 경로는 쇼핑처럼 쉬워야 합니다. 여기서 다음 이야기로 넘어가겠습니다.')

    # ---------------- 34. 해외연수 app ----------------
    sl = S(34); set_title(sl, '7. 해외연수 app 소개')
    device_video(sl, 'phone', 'trip-phone.mp4', 'trip-poster.png', 70, 80, 438, '연수 앱 시연')
    text(sl, 320, 84, 600, 420, [
        H('○ 링크 하나로 여는 연수 전용 앱'),
        {'t': '설치 없이 홈 화면에 추가 · 관리자가 고치면 11명 화면에 바로 반영 · 오프라인에서도 열림 · AI와 함께 직접 개발', 'size': 14, 'color': MUTED, 'indent': 22, 'before': 4},
        H('○ 주요 기능', before=14),
        B('•오늘 — 지금 진행 중 · 남은 시간 · 다음 일정, 옆으로 밀어 날짜 이동', before=5),
        B('•기관 브리핑 — 개요 · 방문 목적 · 사전 질문, 기관별 사전조사 PDF', before=3),
        B('•메모 — 개인 메모 자동 저장, 11명이 함께 쓰는 공유 메모', before=3),
        B('•비상 연락처 — 오늘 밤 숙소 · 영사콜센터 · 110/119 원터치 통화', before=3),
        H('○ 현장에서 써 보니', before=14),
    ], name='앱 소개')
    used = [('모두 · 매일', BLUE, WHITE, '‘지금 진행 중’ 카드와 다음 일정 — 시간표처럼 “다음에 어디 가지?”'),
            ('급할 때 · 나만', 'BDD7EE', DARK, '메모 — 급할 때 잠깐, 아니면 저 혼자 썼습니다'),
            ('생각보다 적게', 'D9D9D9', DARK, '익숙하지 않은 기능은 생각보다 잘 쓰이지 않았습니다')]
    for i, (tag, f, c, d) in enumerate(used):
        yy = 344 + i * 34
        pill(sl, 330, yy, 104, 26, tag, f, c, size=12, name='사용 빈도 ' + str(i + 1))
        text(sl, 446, yy + 3, 474, 24, [{'t': d, 'size': 14, 'bold': i == 0}])
    callout(sl, 320, 460, 600, 44, '결국 가장 많이 쓰인 건 ‘시간표’ — 사람들은 익숙한 모양으로 도구를 씁니다', size=15, name='핵심 문장')
    notes(sl, '[2:25–3:20] (영상이 자동으로 재생됩니다) 연수를 준비하며 만든 앱입니다. 링크 하나로 열고, 이름을 넣으면 오늘 일정이 바로 뜹니다. 지금 화면이 9월 16일 트러스트뱅크 회의 시간 — ‘지금 진행 중’, 남은 시간, 다음 일정이 한눈에 보입니다.\n'
                 '그런데 현장에서 써 보니, 가장 많이 쓴 건 이 ‘지금 진행 중’ 카드와 다음 일정이었습니다. 다들 시간표처럼 썼습니다. 메모는 급할 때만, 사실상 저 혼자 썼고, 익숙하지 않은 기능은 생각보다 잘 쓰이지 않았습니다.\n'
                 '트러스트뱅크 이야기와 같습니다. 사람들은 익숙한 모양으로 도구를 씁니다.')

    # ---------------- 35. 연수 기간 실제 화면 (새 슬라이드) ----------------
    sl = S(35); set_title(sl, '7. 해외연수 app 소개 _ 실제 화면')
    screens = [('x-login', '로그인', '① 처음 한 번', '이름만 입력하면 입장', '성 포함 실명을 넣으면 11명 명단에서 확인, 한 번 넣으면 기기가 기억'),
               ('x-d3', '일정', '② 매일, 가장 많이', '오늘 일정 · 지금 진행 중', '남은 시간과 다음 일정이 저절로 바뀌고, 옆으로 밀면 다른 날'),
               ('x-sos', 'SOS', '③ 만약을 위해', '비상 연락처', '오늘 밤 숙소 · 영사콜센터 · 110/119, 누르면 바로 전화')]
    ph_h = 372; ph_w = ph_h * G['phone']['W'] / G['phone']['H']; col = 300
    for i, (n, label, tag, h, d) in enumerate(screens):
        x = 40 + i * col
        p = sl.Shapes.AddPicture(os.path.join(MEDIA, f'phone-{n}.png'), 0, -1, x, 88, ph_w, ph_h); p.Name = label + ' 화면'
        tx = x + ph_w + 14; tw = col - ph_w - 26
        pill(sl, tx, 170, 64, 26, label, BLUE if label == '일정' else LIGHT, WHITE if label == '일정' else BLUE, size=13, name=label + ' 표시')
        text(sl, tx, 208, tw, 160, [{'t': tag, 'size': 12, 'bold': True, 'color': BLUE},
                                    {'t': h, 'size': 15, 'bold': True, 'before': 4, 'line': 1.15},
                                    {'t': d, 'size': 12, 'color': MUTED, 'before': 8, 'line': 1.2}], name=label + ' 설명')
    callout(sl, 40, 474, 880, 40, '링크 하나 → 이름 입력 → 오늘 일정, 그리고 만약을 위한 SOS', size=15, name='핵심 문장')
    notes(sl, '[3:20–3:50] 실제 화면은 이렇습니다. 링크를 열고 이름만 넣으면 입장 — 한 번 넣으면 다시 묻지 않습니다.\n'
                 '들어가면 가운데 화면, 오늘 일정이 바로 뜹니다. 지금 진행 중인 일정과 남은 시간, 다음 일정이 저절로 바뀌고, 현장에서 가장 많이 쓴 화면입니다.\n'
                 '그리고 만약을 위한 SOS — 오늘 밤 숙소, 영사콜센터, 110·119를 누르면 바로 전화가 걸립니다.')

    # ---------------- 36. 정리 — 도구를 만들어 쓰는 시대 ----------------
    sl = S(36); set_title(sl, '7. 해외연수 app 소개 _ 도구를 만들어 쓰는 시대')
    text(sl, 50, 84, 870, 36, [{'t': [('이제는 우리가 ', {}), ('직접 도구를 만들어', {'color': BLUE}), (' 내 업무에 맞춰 적용할 수 있습니다', {})],
                                'size': 22, 'bold': True}], name='핵심 메시지')
    cards = [('01', '만들 수 있다', '연수 앱도 개발자가 아닌 현장 담당자가 직접 만들어, 11명이 5일 동안 썼습니다'),
             ('02', '하나씩, 취미처럼', '자주 하는 일 · 귀찮은 일 하나를 골라 내 업무에 맞춤형으로 — 취미처럼 하나씩 적용해 보기'),
             ('03', '매일 더 쉬워진다', '더 쉽게 만들고 적용하는 방법이 매일 새롭게 나오고 있습니다')]
    for i, (n, h, d) in enumerate(cards):
        bx = 50 + i * 297
        box(sl, bx, 134, 277, 136, fill=LIGHT, name='메시지 ' + n)
        text(sl, bx + 18, 150, 240, 20, [{'t': n, 'size': 13, 'bold': True, 'color': BLUE}])
        text(sl, bx + 18, 172, 240, 28, [{'t': h, 'size': 19, 'bold': True}])
        text(sl, bx + 18, 206, 244, 60, [{'t': d, 'size': 13, 'color': MUTED, 'line': 1.2}])
    text(sl, 50, 290, 870, 28, [H('○ 시작하는 방법', size=18)], name='시작 제목')
    steps = ['① 매일 반복하는 일 하나 고르기', '② 원하는 모양을 말로 설명하기', '③ 작게 만들어 써 보고 고치기']
    for i, t in enumerate(steps):
        bx = 50 + i * 297
        b = box(sl, bx, 326, 270, 40, fill=WHITE, line=LINE, r=0.5, name='단계 ' + str(i + 1))
        tr = b.TextFrame2.TextRange; tr.Text = t; style_range(tr, 14, True, DARK)
        tr.ParagraphFormat.Alignment = 2; tr.ParagraphFormat.WordWrap = 0; b.TextFrame2.VerticalAnchor = 3
        if i < 2:
            a = sl.Shapes.AddShape(33, bx + 274, 338, 18, 16); a.Fill.ForeColor.RGB = rgb(BLUE); a.Line.Visible = 0; a.Name = '화살표 ' + str(i + 1)
    text(sl, 50, 388, 870, 50, [
        {'t': [('다만 ', {'color': BLUE}), ('익숙한 모양으로, 작게. 그리고 FOMO는 느끼지 않아도 좋습니다', {})], 'size': 16, 'bold': True},
        {'t': '세상은 바뀔 수 있지만, 그렇게 쉽게 바뀌지는 않으니까요', 'size': 13, 'color': MUTED, 'before': 4},
    ], name='당부')
    callout(sl, 44, 456, 876, 48, '고향납세가 ‘쉬운 쇼핑몰’로 자랐듯, 도구도 익숙한 모양일 때 쓰입니다', size=16, name='맺음 문장')
    notes(sl, '[3:50–5:00] 정리하겠습니다. 이제는 우리가 직접 도구를 만들어서, 내 업무에 맞춰 적용할 수 있는 시대입니다. 연수 앱도 개발자가 아닌 현장 담당자가 만들어 11명이 5일 동안 썼습니다.\n'
                 '거창할 필요 없습니다. 매일 반복하는 일, 귀찮은 일 하나를 골라서 내 업무에 맞춤형으로 — 취미처럼 하나씩 적용해 보셔도 좋겠습니다. 더 쉽게 만들고 적용하는 방법이 매일 새롭게 나오고 있습니다.\n'
                 '다만 익숙한 모양으로, 작게. 그리고 FOMO는 느끼지 않아도 괜찮습니다. 세상은 바뀔 수 있지만 그렇게 쉽게 바뀌지는 않습니다. 일본 고향납세도 19년에 걸쳐 자랐습니다. 감사합니다.')

    pres.SaveAs(OUT)
    if PNG:
        os.makedirs(PNG, exist_ok=True)
        for n in range(31, 37):
            pres.Slides.Item(n).Export(os.path.join(PNG, f'f-{n}.png'), 'PNG', 1600, 900)
    print('saved', OUT)
finally:
    pres.Close(); app.Quit()
