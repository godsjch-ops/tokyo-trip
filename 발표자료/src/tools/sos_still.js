// SOS 시트 정지 화면 — 오늘 탭 위에서 열고, 녹화용 사본에서만 비어 보이는 '인솔·현지' 칸은 숨긴다
// (실제 앱은 이 칸에 Firebase 비상 연락처가 뜸 — 개인 번호라 캡처에는 넣지 않음)
const {open}=require('./cdp.js');const OUT=process.argv[2];
(async()=>{const p=await open(9334);await p.init(390,844,0,true);
  const URL='http://127.0.0.1:8765/index.html?t=2026-09-16T13:42:00';
  await p.go(URL,800);
  await p.ev(`localStorage.clear();localStorage.setItem('tw_name','주찬희');localStorage.setItem('tw_login_ok','1');localStorage.setItem('tw_view','field');localStorage.setItem('tw_ftab','today');1`);
  await p.go(URL,2200);
  await p.ev(`openEmergencySheet();1`);await p.sleep(900);
  const hid=await p.ev(`(()=>{const panel=document.querySelector('#fmSheetPanel');let n=0;
    const all=[...panel.querySelectorAll('*')];
    const empty=all.filter(e=>/아직 등록되지 않았/.test(e.textContent)&&e.children.length<6).sort((a,b)=>a.textContent.length-b.textContent.length)[0];
    if(!empty)return 'none';
    let box=empty; while(box.parentElement&&box.parentElement!==panel&&box.parentElement.textContent.length<200)box=box.parentElement;
    const prev=box.previousElementSibling; if(prev&&/인솔/.test(prev.textContent)&&prev.textContent.length<20){prev.style.display='none';n++;}
    box.style.display='none';n++;return 'hidden '+n;})()`);
  console.log(hid);await p.sleep(300);
  await p.shot(OUT);p.close();process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});
