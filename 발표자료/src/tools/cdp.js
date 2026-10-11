// Minimal CDP driver over Node's built-in WebSocket
const fs=require('fs');
async function open(port=9333){
  const t=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
  const ws=new WebSocket(t.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  let id=0; const pend={}, listeners=[];
  ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&pend[m.id]){m.error?pend[m.id].rej(new Error(JSON.stringify(m.error))):pend[m.id].res(m.result);delete pend[m.id];} else listeners.forEach(f=>f(m));};
  const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pend[i]={res,rej};ws.send(JSON.stringify({id:i,method,params}));});
  const P={send,_listen:f=>listeners.push(f),
    async init(w,h,dpr,mobile){await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:dpr,mobile,...(this.viewScale?{scale:this.viewScale}:{})});if(mobile)await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});},
    async go(url,wait=1500){await send('Page.navigate',{url});await new Promise(r=>setTimeout(r,wait));},
    async ev(expr){const r=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails).slice(0,500));return r.result.value;},
    sleep:ms=>new Promise(r=>setTimeout(r,ms)),
    async shot(file,opt={}){const p={format:'png'};if(opt.full){p.captureBeyondViewport=true;const m=await send('Page.getLayoutMetrics');const cs=m.cssContentSize;p.clip={x:0,y:0,width:opt.w||cs.width,height:opt.h||cs.height,scale:1};}
      if(opt.clip){p.clip={...opt.clip,scale:1};p.captureBeyondViewport=true;}
      const r=await send('Page.captureScreenshot',p);fs.writeFileSync(file,Buffer.from(r.data,'base64'));},
    close(){ws.close();}};
  return P;
}
module.exports={open};
