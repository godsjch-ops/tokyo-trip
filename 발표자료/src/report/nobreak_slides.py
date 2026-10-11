"""지정한 슬라이드만 한글 단어 중간 줄바꿈 방지(eaLnBrk="0" + ko-KR). 나머지 슬라이드·미디어는 그대로 복사.
사용: python nobreak_slides.py in.pptx out.pptx 31 32 33 34 35
"""
import re, shutil, sys, zipfile
src, dst, nums = sys.argv[1], sys.argv[2], set(sys.argv[3:])
targets = {f'ppt/slides/slide{n}.xml' for n in nums}
zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(dst + '.tmp', 'w', zipfile.ZIP_DEFLATED, allowZip64=True)
done = 0
for item in zin.infolist():
    data = zin.read(item.filename)
    if item.filename in targets:
        s = data.decode('utf-8')
        s = re.sub(r'<a:pPr(?![^>]*eaLnBrk)(?=[\s/>])', '<a:pPr eaLnBrk="0"', s)
        s = re.sub(r'<a:p>(?!<a:pPr)', '<a:p><a:pPr eaLnBrk="0"/>', s)
        s = s.replace('lang="en-US" altLang="ko-KR"', 'lang="ko-KR" altLang="en-US"')
        s = re.sub(r'lang="en-US"(?! altLang)', 'lang="ko-KR" altLang="en-US"', s)
        s = s.replace(' latinLnBrk="1"', '')
        s = re.sub(r'<a:pPr(?![^>]*latinLnBrk)(?=[\s/>])', '<a:pPr latinLnBrk="0"', s)
        data = s.encode('utf-8'); done += 1
    info = zipfile.ZipInfo(item.filename, date_time=item.date_time)
    info.compress_type = zipfile.ZIP_STORED if item.filename.lower().endswith(('.mp4', '.png', '.jpg', '.jpeg', '.mov')) else zipfile.ZIP_DEFLATED
    zout.writestr(info, data)
zout.close(); zin.close()
shutil.move(dst + '.tmp', dst)
print('patched slides:', done)
