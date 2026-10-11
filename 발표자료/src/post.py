"""build.js 출력 후처리.
1) 테마 색(clrScheme)을 THEME 값으로 교체 — pptxgenjs는 테마 색을 못 쓴다.
2) 한글 단어 중간 줄바꿈 방지: 모든 문단 eaLnBrk="0" + 글자 언어 ko-KR.
사용: python post.py raw.pptx out.pptx
"""
import json, os, re, shutil, sys, zipfile

src, dst = sys.argv[1], sys.argv[2]
THEME = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'theme.json'), encoding='utf-8'))
ORDER = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink']

def theme_xml(s):
    cols = ''.join(f'<a:{k}><a:srgbClr val="{THEME["colors"][k]}"/></a:{k}>' for k in ORDER)
    name = THEME['name']
    s = re.sub(r'<a:clrScheme name="[^"]*">.*?</a:clrScheme>', f'<a:clrScheme name="{name}">{cols}</a:clrScheme>', s, flags=re.S)
    s = re.sub(r'(<a:theme [^>]*name=")[^"]*', r'\g<1>' + name, s)
    return s

def no_break(s):
    s = re.sub(r'<a:pPr(?![^>]*eaLnBrk)(?=[\s/>])', '<a:pPr eaLnBrk="0"', s)
    s = re.sub(r'<a:p>(?!<a:pPr)', '<a:p><a:pPr eaLnBrk="0"/>', s)
    s = s.replace('lang="en-US"', 'lang="ko-KR" altLang="en-US"').replace('altLang="en-US" altLang="en-US"', 'altLang="en-US"')
    return s

zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(dst + '.tmp', 'w', zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data = zin.read(item.filename)
    if re.match(r'ppt/theme/theme\d+\.xml$', item.filename):
        data = theme_xml(data.decode('utf-8')).encode('utf-8')
    elif re.match(r'ppt/(slides|slideLayouts|slideMasters)/[^/]+\.xml$', item.filename):
        data = no_break(data.decode('utf-8')).encode('utf-8')
    info = zipfile.ZipInfo(item.filename, date_time=item.date_time)
    info.compress_type = zipfile.ZIP_STORED if item.filename.endswith(('.mp4', '.png', '.jpg')) else zipfile.ZIP_DEFLATED
    zout.writestr(info, data)
zout.close(); zin.close()
shutil.move(dst + '.tmp', dst)
print('post-processed', dst)
