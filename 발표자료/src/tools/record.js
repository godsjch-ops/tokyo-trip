// Real-time recording of the field-mode app via CDP screencast, with a touch indicator.
const {open}=require('./cdp.js');const fs=require('fs');const path=require('path');
const OUT=process.argv[2]; fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(OUT,{recursive:true});
const URL='http://127.0.0.1:8765/index.html?t=2026-09-16T13:42:00';
const TOUCH=`(()=>{const st=document.createElement('style');st.textContent='.__tdot{position:fixed;z-index:2147483647;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(40,40,50,.28);border:2px solid rgba(255,255,255,.85);box-shadow:0 2px 10px rgba(0,0,0,.25);pointer-events:none;transition:opacity .2s,transform .2s;opacity:0;transform:scale(.6)}.__tdot.on{opacity:1;transform:scale(1)}';
document.documentElement.appendChild(st);let d;const pos=t=>{if(!d){d=document.createElement('div');d.className='__tdot';document.documentElement.appendChild(d);}d.style.left=t.clientX+'px';d.style.top=t.clientY+'px';};
addEventListener('touchstart',e=>{pos(e.touches[0]);d.classList.add('on')},{capture:true,passive:true});
addEventListener('touchmove',e=>pos(e.touches[0]),{capture:true,passive:true});
addEventListener('touchend',e=>{d&&d.classList.remove('on')},{capture:true,passive:true});
window.__finger=(x,y,on)=>{pos({clientX:x,clientY:y});d.classList.toggle('on',!!on);};})()`;

(async()=>{const p=await open(+(process.env.PORT||9333));await p.init(390,844,+(process.env.DPR||2),true);
  await p.go(URL,800); await p.ev(`localStorage.clear();1`);
  await p.send('Page.addScriptToEvaluateOnNewDocument',{source:`addEventListener('DOMContentLoaded',()=>{${TOUCH}})`});
  await p.go(URL,2500);
  const frames=[];let n=0;
  p._listen(m=>{ if(m.method==='Page.screencastFrame'){const f=String(n++).padStart(5,'0')+'.jpg';fs.writeFileSync(path.join(OUT,f),Buffer.from(m.params.data,'base64'));frames.push({f,ts:m.params.metadata.timestamp});p.send('Page.screencastFrameAck',{sessionId:m.params.sessionId}).catch(()=>{});} });
  const S=ms=>p.sleep(ms);
  const T=(type,x,y)=>p.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,radiusX:8,radiusY:8,force:1}]});
  const inout=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  async function tap(x,y,hold=120){await T('touchStart',x,y);await S(hold);await T('touchEnd');}
  async function drag(x0,y0,x1,y1,ms,ease=inout){await T('touchStart',x0,y0);const steps=Math.max(6,Math.round(ms/16));for(let i=1;i<=steps;i++){const k=ease(i/steps);await T('touchMove',x0+(x1-x0)*k,y0+(y1-y0)*k);await S(12);}await S(30);await T('touchEnd');}
  // Smooth scroll of a real scroll container with a finger dot riding along (content follows finger, then decelerates).
  async function swipeScroll(containerJs,dy,ms){
    await p.ev(`(()=>{const el=${containerJs};if(!el)return 0;const y0=el.scrollTop,t0=performance.now(),d=${dy},D=${ms};const fx=260,fy0=${dy}>0?660:300,fy1=fy0-Math.sign(d)*300;
      return new Promise(r=>{function f(t){const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);el.scrollTop=y0+d*e;
        const fk=Math.min(1,k/0.35);window.__finger&&window.__finger(fx,fy0+(fy1-fy0)*inout(fk),k<0.35);
        k<1?requestAnimationFrame(f):r(1)}const inout=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;requestAnimationFrame(f)})})()`);}
  const FM=`document.querySelector('#fieldMode')`;
  const SHEETSC=`[...document.querySelectorAll('#fmSheetPanel *')].find(e=>e.scrollHeight>e.clientHeight+20&&/(auto|scroll)/.test(getComputedStyle(e).overflowY))`;
  const rect=async js=>p.ev(`(()=>{const e=${js};if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await p.send('Page.startScreencast',{format:'jpeg',quality:93,maxWidth:780,maxHeight:1688,everyNthFrame:1});
  const t0=Date.now();const marks=[];const mark=l=>{const s=(Date.now()-t0)/1000;marks.push([l,s]);console.log(s.toFixed(2),l);};
  await S(1000); mark('login');
  let r=await rect(`document.querySelector('#loginGate input')`); await tap(r.x,r.y); await S(400);
  for(const ch of ['주','찬','희']){await p.send('Input.insertText',{text:ch});await S(330);}
  await S(450); r=await rect(`[...document.querySelectorAll('#loginGate button')].find(b=>/입장/.test(b.textContent))`); await tap(r.x,r.y,150);
  await S(2800); mark('today');
  await swipeScroll(FM,560,1300); await S(900);
  await swipeScroll(FM,-900,1100); await S(900); mark('swipe');
  await drag(340,640,50,640,360,t=>t); await S(1700);
  await drag(50,640,340,640,360,t=>t); await S(1200); mark('sheet');
  r=await rect(`[...document.querySelectorAll('#fieldMode button')].find(b=>/기관 정보 보기/.test(b.textContent))`); await tap(r.x,r.y,140);
  await S(1900);
  await swipeScroll(SHEETSC,520,1300); await S(1500);
  await swipeScroll(SHEETSC,-520,900); await S(500);
  r=await rect(`document.querySelector('#fmSheetPanel .sh-grip')`); if(r){await drag(r.x,r.y+4,r.x,r.y+560,520);} await S(1100); mark('orgs');
  r=await rect(`document.querySelector('button[data-tab="orgs"]')`); await tap(r.x,r.y); await S(1500);
  await swipeScroll(FM,620,1300); await S(1100); mark('sos');
  r=await rect(`[...document.querySelectorAll('#fieldMode button')].find(b=>/🆘|SOS|비상/.test(b.textContent))`); if(r){await tap(r.x,r.y);} else console.log('no sos');
  await S(2800);
  r=await rect(`document.querySelector('#fmSheetPanel .sh-grip')`); if(r){await drag(r.x,r.y+4,r.x,r.y+560,520);} await S(900);
  r=await rect(`document.querySelector('button[data-tab="today"]')`); await tap(r.x,r.y); await S(1800); mark('end');
  await p.send('Page.stopScreencast'); await S(300);
  fs.writeFileSync(path.join(OUT,'frames.json'),JSON.stringify({frames,marks}));
  console.log('frames',frames.length,'span',(frames.at(-1).ts-frames[0].ts).toFixed(2));
  p.close();process.exit(0);})().catch(e=>{console.error(e);process.exit(1);});
