// 연수 기간 각 날짜·시각의 '오늘' 화면 (앱 시계를 그 시각으로 고정해서 캡처)
const {open}=require('./cdp.js');const O=process.argv[2];
const MOMENTS=[['d1','2026-09-14T15:20:00'],['d2','2026-09-15T09:30:00'],['d3','2026-09-16T13:42:00'],['d4','2026-09-17T12:50:00'],['d5','2026-09-18T10:20:00']];
(async()=>{const p=await open(9334);await p.init(390,844,0,true);
  await p.go('http://127.0.0.1:8765/index.html',800);
  await p.ev(`localStorage.clear();localStorage.setItem('tw_name','주찬희');localStorage.setItem('tw_login_ok','1');localStorage.setItem('tw_view','field');localStorage.setItem('tw_ftab','today');1`);
  for(const [n,t] of MOMENTS){
    await p.go('http://127.0.0.1:8765/index.html?t='+t,2200);
    const now=await p.ev(`(()=>{const c=document.querySelector('#fieldMode');return (c.innerText||'').split('\\n').slice(0,14).join(' | ')})()`);
    console.log(n,t,'::',now.slice(0,220));
    await p.shot(O+'/m-'+n+'.png');
  }
  p.close();process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});
