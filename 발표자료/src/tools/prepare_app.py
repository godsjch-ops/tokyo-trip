"""녹화용 앱 사본 만들기 (원본 index.html은 건드리지 않음).
- Firebase 끔 → 이 기기 저장소만 사용(실제 공유 DB에 접속·기록하지 않음), 데이터는 코드의 확정 일정(seed)
- ?t=2026-09-16T13:42:00 처럼 주소에 시각을 주면 앱 시계를 그 시각으로 고정
- 서비스워커 등록 제거(녹화 중 캐시 꼬임 방지)
사용: python prepare_app.py <tokyo-trip 저장소 폴더> <출력 폴더>
"""
import io, os, re, shutil, sys
repo, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
for f in ['index.html', 'manifest.json', 'logo.png', 'icon-180.png', 'icon-192.png', 'icon-512.png',
          '2026 따뜻한동행 일본 해외연수 계획서_20260903.pdf']:
    shutil.copy(os.path.join(repo, f), out)
shutil.copytree(os.path.join(repo, '핸드북'), os.path.join(out, '핸드북'), dirs_exist_ok=True)
p = os.path.join(out, 'index.html')
s = io.open(p, encoding='utf-8').read()
s = re.sub(r'const FIREBASE_CONFIG=\{.*?\n\};', 'const FIREBASE_CONFIG=null;', s, count=1, flags=re.S)
s = s.replace('navigator.serviceWorker.register("./service-worker.js").catch(()=>{});', '')
clock = ('<script>(function(){var q=new URLSearchParams(location.search),t=q.get("t");if(!t)return;'
         'var B=new Date(t).getTime(),R=Date,S=R.now();function D(){var a=[].slice.call(arguments);'
         'return a.length?new (Function.prototype.bind.apply(R,[null].concat(a))):new R(B+(R.now()-S));}'
         'D.now=function(){return B+(R.now()-S)};D.parse=R.parse;D.UTC=R.UTC;D.prototype=R.prototype;window.Date=D;})();</script>')
s = s.replace('<head>', '<head>' + clock, 1)
io.open(p, 'w', encoding='utf-8').write(s)
print('ready:', out)
