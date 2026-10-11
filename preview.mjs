import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('site');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript'};
http.createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const target=resolve(root,'.'+(path==='/'?'/index.html':path));if(!target.startsWith(root+'\\')&&!target.startsWith(root+'/')){res.writeHead(403);res.end();return;}const data=await readFile(target);res.writeHead(200,{'Content-Type':mime[extname(target)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:4173'));
