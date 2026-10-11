// High-res static screens of the field mode (Chrome on port 9334 runs at 2x device scale).
const {open}=require('./cdp.js');const O=process.argv[2];
const URL='http://127.0.0.1:8765/index.html?t=2026-09-16T13:42:00';
const SHEETSC=`[...document.querySelectorAll('#fmSheetPanel *')].find(e=>e.scrollHeight>e.clientHeight+20&&/(auto|scroll)/.test(getComputedStyle(e).overflowY))`;
(async()=>{const p=await open(9334);await p.init(390,844,0,true);
  await p.go(URL,800);
  await p.ev(`localStorage.clear();localStorage.setItem('tw_name','주찬희');localStorage.setItem('tw_login_ok','1');localStorage.setItem('tw_view','field');localStorage.setItem('tw_ftab','today');1`);
  await p.go(URL,2500);
  await p.shot(O+'/s-today.png');
  await p.ev(`openOrgSheet('org-6');1`);await p.sleep(900);await p.shot(O+'/s-sheet.png');
  // scroll to memo zone
  await p.ev(`(()=>{const c=${SHEETSC};const z=document.querySelector('#fmSheetPanel .sh-memozone')||document.querySelector('#fmSheetPanel .sh-hinge');c.scrollTop=(z?z.offsetTop-120:c.scrollHeight);return c.scrollTop})()`);await p.sleep(700);
  await p.shot(O+'/s-memo.png');
  await p.ev(`(()=>{const b=document.querySelector('#fmSheetPanel .sh-grip');closeSheet&&closeSheet();return 1})()`).catch(()=>{});
  await p.go(URL,2000);
  await p.ev(`fieldTab('orgs');1`);await p.sleep(700);await p.shot(O+'/s-orgs.png');
  await p.ev(`openEmergencySheet();1`);await p.sleep(900);await p.shot(O+'/s-sos.png');
  await p.go(URL,1500);await p.ev(`fieldTab('lodging');1`);await p.sleep(700);await p.shot(O+'/s-lodging.png');
  await p.ev(`fieldTab('all');1`);await p.sleep(700);await p.shot(O+'/s-more.png');
  p.close();process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});
