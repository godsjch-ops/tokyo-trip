"""사용자가 직접 고친 결과보고 파일의 마지막 장(7번 정리)만 수정한다 — 다른 슬라이드는 건드리지 않음.
사용: python edit35.py <입력.pptx> <출력.pptx> <슬라이드 번호> [png]
"""
import os, sys
import pythoncom, win32com.client

SRC, OUT, N = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2]), int(sys.argv[3])
PNG = os.path.abspath(sys.argv[4]) if len(sys.argv) > 4 else None
FONT, DARK, BLUE, MUTED = '나눔바른고딕', '262626', '0070C0', '595959'

def rgb(h): return int(h[0:2], 16) + int(h[2:4], 16) * 256 + int(h[4:6], 16) * 65536
def pget(obj, name, *args):
    o = obj._oleobj_
    return win32com.client.Dispatch(o.Invoke(o.GetIDsOfNames(name), 0, pythoncom.DISPATCH_PROPERTYGET, True, *args))
def style(r, size, bold, color):
    r.Font.Name = FONT; r.Font.NameFarEast = FONT; r.Font.Size = size
    r.Font.Bold = -1 if bold else 0; r.Font.Fill.ForeColor.RGB = rgb(color); r.LanguageID = 1042

def set_runs(shp, paras):
    """paras: [(size, bold, [(text, color), ...], space_before)]"""
    tr = shp.TextFrame2.TextRange
    tr.Text = '\r'.join(''.join(t for t, _ in runs) for _, _, runs, _ in paras)
    for i, (size, bold, runs, before) in enumerate(paras, 1):
        p = pget(tr, 'Paragraphs', i, 1)
        style(p, size, bold, DARK); p.ParagraphFormat.SpaceBefore = before; p.ParagraphFormat.WordWrap = 0
        pos = 1
        for t, c in runs:
            if c != DARK: style(pget(p, 'Characters', pos, len(t)), size, bold, c)
            pos += len(t)

app = win32com.client.Dispatch('PowerPoint.Application')
pres = app.Presentations.Open(SRC, 0, 0, 0)
try:
    sl = pres.Slides.Item(N)
    title = sl.Shapes.Item(1).TextFrame.TextRange.Text if sl.Shapes.Count else ''
    shapes = {s.Name: s for s in sl.Shapes}
    assert '당부' in shapes and '맺음 문장' in shapes, f'slide {N} is not the closing slide: {list(shapes)}'
    d = shapes['당부']
    d.Top = 384; d.Height = 56
    set_runs(d, [
        (17, True, [('지금 여러분이 문제라고 느끼는 부분, 그 문제의 전문가는 ', DARK), ('바로 여러분', BLUE), ('입니다', DARK)], 0),
        (13, False, [('다만 익숙한 모양으로, 작게 — FOMO는 느끼지 않아도 좋습니다. 세상은 그렇게 쉽게 바뀌지 않으니까요', MUTED)], 5),
    ])
    c = shapes['맺음 문장']
    tr = c.TextFrame2.TextRange
    tr.Text = '가진 문제를 AI와 함께 해결해 보는 경험, 여러분도 누려 보시길 바랍니다'
    style(tr, 17, True, BLUE); tr.ParagraphFormat.Alignment = 2; tr.ParagraphFormat.WordWrap = 0
    sl.NotesPage.Shapes.Placeholders(2).TextFrame.TextRange.Text = (
        '[3:20–5:00] 정리하겠습니다. 이제는 우리가 직접 도구를 만들어서, 내 업무에 맞춰 적용할 수 있는 시대입니다. 연수 앱도 개발자가 아닌 현장 담당자가 만들어 11명이 5일 동안 썼습니다.\n'
        '거창할 필요 없습니다. 매일 반복하는 일, 귀찮은 일 하나를 골라서 취미처럼 하나씩 적용해 보셔도 좋겠습니다. 더 쉽게 만들고 적용하는 방법이 매일 새롭게 나오고 있습니다. 다만 익숙한 모양으로, 작게 — FOMO는 느끼지 않아도 괜찮습니다.\n'
        '마지막으로 꼭 드리고 싶은 말이 있습니다. 지금 여러분이 문제라고 느끼는 부분은, 여러분이 제일 전문가입니다. 팀장님도, 부장님도, 그리고 새로 생길지 안 생길지도 모르는 IT팀도 모릅니다.\n'
        '가진 문제를 AI와 함께 해결해 보는 경험을, 여러분도 누려 보시길 바랍니다. 감사합니다.')
    pres.SaveAs(OUT)
    if PNG: sl.Export(PNG, 'PNG', 1600, 900)
    print('edited slide', N, '-', title)
finally:
    pres.Close(); app.Quit()
