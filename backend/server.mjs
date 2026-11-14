import http from 'node:http';
import {Jobs} from './jobs.mjs';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { readConfig,backendDir } from './config.mjs';
import { openAuth,addUser,passwordHash,passwordMatches,createSession,sessionFor,hashToken,safeEqual } from './auth.mjs';
const config=readConfig(),auth=openAuth(config),calls=new Map(),jobs=new Jobs();
let seq=0,ready=false,closed=false,sharedStatus=null;
const processor=new Worker(new URL('./data-worker.mjs',import.meta.url),{workerData:config});
const startup=new Promise((resolve,reject)=>{
 processor.on('message',m=>{if(m.statusUpdate){sharedStatus=m.statusUpdate;if(!m.ready)return;}if(m.ready){ready=true;resolve();return;}if(m.fatal){reject(Error(m.fatal));return;}const call=calls.get(m.id);if(!call)return;calls.delete(m.id);if(m.error){const error=Error(m.error);error.status=m.status;error.code=m.code;call.reject(error);}else call.resolve(m.result);});
 processor.on('error',error=>{reject(error);for(const c of calls.values())c.reject(error);calls.clear();});
 processor.on('exit',code=>{ready=false;if(!closed){console.error('Data worker stopped:',code,'Restarting through the configured OS service manager.');setTimeout(()=>process.exit(1),100);}for(const c of calls.values())c.reject(Object.assign(Error('Data processor unavailable. The service is restarting.'),{status:503}));calls.clear();});
});
function task(type,payload={}){if(!ready)return Promise.reject(Object.assign(Error('Data processor is starting.'),{status:503}));return new Promise((resolve,reject)=>{const id=++seq;calls.set(id,{resolve,reject});processor.postMessage({id,type,payload});});}
function fail(message,status=400,code='INVALID_REQUEST'){return Object.assign(Error(message),{status,code});}
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
function cookie(req){let match=(req.headers.cookie||'').match(/(?:^|;\s*)othoba_session=([^;]+)/);return match?.[1]||'';}
function userFor(req){return sessionFor(auth,cookie(req));}
function requireUser(req,admin=false){const user=userFor(req);if(!user)throw fail('Sign in to continue.',401,'UNAUTHENTICATED');if(admin&&user.role!=='admin')throw fail('Only administrators can change shared reporting history.',403,'FORBIDDEN');return user;}
function checkOrigin(req){const origin=req.headers.origin,expected=config.allowedOrigin||`http://${req.headers.host}`;if(!origin||origin!==expected)throw fail('The request origin is not allowed.',403,'ORIGIN_REJECTED');if(!config.allowedOrigin&&!/^localhost(?::\d+)?$|^127\.0\.0\.1(?::\d+)?$|^\[::1\](?::\d+)?$/.test(req.headers.host||''))throw fail('Set publicOrigin in the backend configuration.',403);}
function checkMutation(req,user){checkOrigin(req);if(!safeEqual(req.headers['x-csrf-token'],user.csrf))throw fail('Refresh your session and try again.',403,'CSRF_REJECTED');}
async function body(req,mb){const declared=Number(req.headers['content-length']||0),limit=mb*1048576;if(declared>limit){req.resume();throw fail('Upload exceeds the configured size limit.',413);}if(!String(req.headers['content-type']||'').toLowerCase().startsWith('application/json')){req.resume();throw fail('Send application/json.',415);}let parts=[],size=0;for await(const chunk of req){size+=chunk.length;if(size>limit){req.resume();throw fail('Upload exceeds the configured size limit.',413);}parts.push(chunk);}try{return JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{throw fail('Invalid JSON request body.');}}
const attempts=new Map(),dummyHash=await passwordHash('not-a-real-password-'+Date.now());
function clientKey(req){const remote=req.socket.remoteAddress||'';if(config.trustProxy&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(remote))return String(req.headers['x-forwarded-for']||remote).split(',').at(-1).trim();return remote;}
function setSession(res,token,maxAge=config.sessionHours*3600){res.setHeader('Set-Cookie',`othoba_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${config.secureCookies?'; Secure':''}`);}
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.ico':'image/x-icon','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
async function staticFile(req,res,pathname){
 let decoded;try{decoded=decodeURIComponent(pathname);}catch{throw fail('Invalid path.');}
 if(decoded.includes('\\')||decoded.includes('\0'))throw fail('Invalid path.');
 const target=path.resolve(config.frontendDir,'.'+(decoded==='/'?'/index.html':decoded));
 if(!target.startsWith(config.frontendDir+path.sep)||!mime[path.extname(target)])throw fail('Not found.',404);
 let actual,stat;try{actual=await fs.promises.realpath(target);stat=await fs.promises.stat(actual);}catch{throw fail('Not found.',404);}
 if(!actual.startsWith(config.frontendDir+path.sep)||!stat.isFile())throw fail('Not found.',404);
 res.writeHead(200,{'Content-Type':mime[path.extname(actual)],'Content-Length':stat.size,'Cache-Control':/\.[a-f0-9]{10,}\.\w+$/.test(actual)?'public, max-age=31536000, immutable':'no-cache'});
 if(req.method==='HEAD')return res.end();fs.createReadStream(actual).pipe(res);
}
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','SAMEORIGIN');res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
 const requestURL=new URL(req.url,'http://localhost'),pathname=requestURL.pathname;
 const dispatch=(user,type,payload)=>{if(requestURL.searchParams.get('async')!=='1')return task(type,payload).then(result=>json(res,200,result));let key=String(payload.requestId||'');if(!/^[a-zA-Z0-9-]{16,80}$/.test(key))throw fail('A unique requestId is required.');let signature=createHash('sha256').update(type+JSON.stringify(payload)).digest('hex'),job=jobs.submit(String(user.id),key,signature,()=>task(type,payload));return json(res,202,jobs.public(job));};
 try{
  if(pathname==='/api/health'&&req.method==='GET')return json(res,ready?200:503,{ok:ready,version:'2.1.0',pendingTasks:calls.size});
  if(pathname==='/api/login'&&req.method==='POST'){
   checkOrigin(req);const key=clientKey(req),record=attempts.get(key);if(record&&record.until>Date.now()&&record.count>=8)throw fail('Too many sign-in attempts. Try again in 15 minutes.',429,'RATE_LIMITED');
   const attempt=record&&record.until>Date.now()?record:{count:0,until:Date.now()+15*60000};attempt.count++;attempts.set(key,attempt);const input=await body(req,.02),username=String(input.username||'').trim().toLowerCase(),password=typeof input.password==='string'?input.password:'';if(password.length>256)throw fail('Invalid username or password.',401);
   const user=auth.prepare('SELECT id,username,password_hash,role,active FROM users WHERE username=?').get(username),valid=await passwordMatches(password,user?.password_hash||dummyHash);
   if(!user||!user.active||!valid){if(attempts.size>10000)for(const[k,v]of attempts)if(v.until<Date.now())attempts.delete(k);throw fail('Invalid username or password.',401,'LOGIN_FAILED');}
   attempts.delete(key);const session=createSession(auth,user,config);setSession(res,session.token);return json(res,200,{user:{username:user.username,role:user.role},csrf:session.csrf,expiresAt:session.expires});
  }
  if(pathname==='/api/me'&&req.method==='GET'){const user=requireUser(req);return json(res,200,{user:{username:user.username,role:user.role},csrf:user.csrf,expiresAt:user.expires_at});}
  if(pathname==='/api/logout'&&req.method==='POST'){const user=requireUser(req);checkMutation(req,user);auth.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(cookie(req)));setSession(res,'',0);return json(res,200,{ok:true});}
  if(pathname==='/api/diagnostics'&&req.method==='GET'){requireUser(req,true);return json(res,200,{version:'2.1.0',processorReady:ready,pendingTasks:calls.size,rssMB:Math.round(process.memoryUsage().rss/1048576),uptimeSeconds:Math.round(process.uptime())});}
  if(pathname==='/api/users'&&req.method==='GET'){requireUser(req,true);return json(res,200,{users:auth.prepare('SELECT id,username,role,active,created_at FROM users ORDER BY username').all()});}
  if(pathname==='/api/users'&&req.method==='POST'){const actor=requireUser(req,true);checkMutation(req,actor);const input=await body(req,.02);try{const user=await addUser(auth,input.username,input.password,input.role||'viewer');console.log('User created by account '+actor.id+': '+user.username+' ('+user.role+')');return json(res,201,{user});}catch(e){throw fail(String(e.message).includes('UNIQUE constraint')?'This username already exists.':e.message,400);}}
  if(['/api/reports/list','/api/reports/download'].includes(pathname)&&req.method==='POST'){const user=requireUser(req);checkMutation(req,user);const input=await body(req,.01);return await dispatch(user,pathname.endsWith('/list')?'reportsList':'reportDownload',input);}
  if(pathname==='/api/state/prepare'&&req.method==='POST'){const user=requireUser(req);checkMutation(req,user);let input=await body(req,.01);return await dispatch(user,'snapshot',{requestId:input.requestId});}
  if(/^\/api\/jobs\/[a-f0-9-]+(?:\/download)?$/.test(pathname)&&req.method==='GET'){const user=requireUser(req),id=pathname.split('/')[3],job=jobs.get(String(user.id),id);if(pathname.endsWith('/download')){if(job.state!=='complete'||!job.result?.file)throw fail('Download is not ready.',409);const snapshot=job.result;let stat;try{stat=await fs.promises.stat(snapshot.file);}catch{throw fail('A newer shared snapshot is available. Refresh to download it.',409);}let headers={'Content-Type':'application/octet-stream','Content-Length':stat.size,'Cache-Control':'private, no-store'};if(snapshot.kind==='source'){headers['Content-Type']='text/csv; charset=utf-8';headers['Content-Encoding']='gzip';headers['Content-Disposition']='attachment; filename="Othoba_Source.csv"; filename*=UTF-8\'\''+encodeURIComponent(snapshot.filename);}else{headers['X-Othoba-Revision']=String(snapshot.revision);headers['X-Othoba-Instance']=snapshot.instanceId;}res.writeHead(200,headers);return fs.createReadStream(snapshot.file).on('error',()=>res.destroy()).pipe(res);}return json(res,200,jobs.public(job));}
  if(pathname==='/api/status'&&req.method==='GET'){requireUser(req);return json(res,200,sharedStatus||await task('status'));}
  if(pathname==='/api/state'&&req.method==='GET'){
   requireUser(req);const status=await task('status'),etag=`"${status.instanceId}:${status.revision}"`;if(req.headers['if-none-match']===etag){res.writeHead(304,{'ETag':etag,'Cache-Control':'private, no-cache'});return res.end();}
   const snapshot=await task('snapshot'),stat=await fs.promises.stat(snapshot.file);res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Length':stat.size,'Cache-Control':'private, no-cache','ETag':`"${snapshot.instanceId}:${snapshot.revision}"`,'X-Othoba-Revision':String(snapshot.revision),'X-Othoba-Instance':snapshot.instanceId});return fs.createReadStream(snapshot.file).pipe(res);
  }
  if(pathname==='/api/offline-template'&&req.method==='GET'){requireUser(req);const file=path.join(backendDir,'templates','offline-template.html.gz');res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','Content-Encoding':'gzip','Cache-Control':'private, max-age=300'});return fs.createReadStream(file).pipe(res);}
  if(/^\/api\/(imports|targets)\/batch\/(start|file|operation|commit|discard)$/.test(pathname)&&req.method==='POST'){
   const user=requireUser(req,true);checkMutation(req,user);if(calls.size>=16)throw fail('The server is processing uploads. Try again shortly.',429);const [,section,action]=pathname.match(/^\/api\/(imports|targets)\/batch\/(start|file|operation|commit|discard)$/),input=await body(req,action==='file'?config.maxCsvMB*6+1:1),mode=section==='imports'?'sales':'targets',types={start:'batchStart',file:'batchFile',operation:'batchOperation',commit:'batchCommit',discard:'batchDiscard'};return await dispatch(user,types[action],{...input,mode,actor:String(user.id)});
  }
  if(['/api/backups/preview','/api/backups/commit'].includes(pathname)&&req.method==='POST'){const user=requireUser(req,true);checkMutation(req,user);const action=pathname.endsWith('/preview')?'restorePreview':'restoreCommit',input=await body(req,action==='restorePreview'?config.maxBackupMB*6+1:1);if(action==='restorePreview'&&(typeof input.text!=='string'||Buffer.byteLength(input.text)>config.maxBackupMB*1048576))throw fail('Backup is empty or exceeds the configured limit.',413);return await dispatch(user,action,{...input,actor:String(user.id)});}
  if(pathname.startsWith('/api/'))throw fail('API endpoint not found.',404);
  if(!['GET','HEAD'].includes(req.method))throw fail('Method not allowed.',405);
  return await staticFile(req,res,pathname);
 }catch(error){if(res.headersSent){res.destroy();return;}const status=error.status||500;if(status===500)console.error('Request failed:',pathname,error.message);json(res,status,{error:status===500?'The server could not complete the request. Check the backend logs.':error.message,code:error.code||'SERVER_ERROR'});}
});
server.requestTimeout=10*60000;server.headersTimeout=65000;
await startup;
let autoBackupTimer=null,backupBusy=false;
async function autoBackup(){if(backupBusy)return;backupBusy=true;try{await task('salesBackup');const directory=path.join(config.dataDir,'backups'),stamp=new Date().toISOString().replace(/[:.]/g,'-');auth.prepare('VACUUM INTO ?').run(path.join(directory,'auth-'+stamp+'.sqlite'));const cutoff=Date.now()-config.backupRetentionDays*864e5;for(const name of fs.readdirSync(directory))if(/^auth-\d/.test(name)){const p=path.join(directory,name);if(fs.statSync(p).mtimeMs<cutoff)fs.rmSync(p,{force:true});}console.log('Automatic database backup completed.');}catch(e){console.error('Automatic backup failed:',e.message);}finally{backupBusy=false;}}
if(config.autoBackupHours>0){autoBackupTimer=setInterval(autoBackup,Math.min(config.autoBackupHours*3600000,2147483647));autoBackupTimer.unref();autoBackup();}
server.listen(config.port,config.host,()=>console.log(`Othoba Performance server ready on ${config.host}:${config.port}`));
async function shutdown(){if(closed)return;closed=true;if(autoBackupTimer)clearInterval(autoBackupTimer);server.close();try{await task('close');}catch{}await processor.terminate();auth.close();process.exit(0);}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
