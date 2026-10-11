const http=require('http'),fs=require('fs'),path=require('path');
const root=process.argv[2],port=+process.argv[3];
const T={'.html':'text/html; charset=utf-8','.png':'image/png','.json':'application/json','.pdf':'application/pdf','.js':'text/javascript','.mp4':'video/mp4','.jpg':'image/jpeg'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(root,p);
fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});r.end(b);});}).listen(port,'127.0.0.1',()=>console.log('serving',root,port));
