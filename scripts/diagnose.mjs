// Run from the private package root on the server; prints no credentials.
import {readConfig} from '../backend/config.mjs';import fs from 'node:fs';import os from 'node:os';
const c=readConfig(),host=c.host==='::1'?'[::1]':c.host==='0.0.0.0'?'127.0.0.1':c.host,url='http://'+host+':'+c.port+'/api/health';
console.log('Node:',process.version,'| Platform:',process.platform,'| System RAM GB:',(os.totalmem()/1073741824).toFixed(1));
try{fs.accessSync(c.dataDir,fs.constants.R_OK|fs.constants.W_OK);console.log('Private data directory: readable and writable');}catch{console.error('Private data directory: permission denied');process.exitCode=1;}
console.log('Checking direct backend:',url);
try{const r=await fetch(url,{signal:AbortSignal.timeout(5000)}),health=await r.json();console.log('HTTP:',r.status,'| Backend:',health.ok?'ready':'not ready','| Version:',health.version,'| Queued tasks:',health.pendingTasks);if(!r.ok)process.exitCode=1;console.log('If this succeeds while the website returns 502, inspect the reverse proxy route, backend port and IIS/Nginx logs.');}catch(e){console.error('Backend unreachable:',e.message);console.error('Start/restart the Node service; check stdout/stderr, the configured port and available memory.');process.exitCode=1;}
