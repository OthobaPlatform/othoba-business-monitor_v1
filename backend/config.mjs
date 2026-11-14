import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const backendDir=path.dirname(fileURLToPath(import.meta.url));
export const packageDir=path.dirname(backendDir);
export function readConfig(){
 const [major,minor]=process.versions.node.split('.').map(Number);if(major!==24||minor<14)throw Error('Use a supported Node.js 24 LTS release, version 24.14 or newer within 24.x.');
 const file=process.env.OTHOBA_CONFIG||path.join(backendDir,'config.json');
 const configured=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
 const value={host:'127.0.0.1',port:3011,publicOrigin:'',trustProxy:false,secureCookies:false,dataDir:'./data',sessionHours:8,maxCsvMB:20,maxPreviewMB:512,maxBackupMB:256,autoBackupHours:24,backupRetentionDays:14,maxPreviewBatches:8,previewMinutes:60,seedIncludedReports:false,...configured};
 if(value.seedIncludedReports)throw Error('This package starts clean. Import reports or restore a JSON backup through the dashboard.');
 for(const k of ['maxCsvMB','maxPreviewMB','maxBackupMB','maxPreviewBatches','previewMinutes','backupRetentionDays'])if(!Number.isFinite(value[k])||value[k]<=0)throw Error('Invalid '+k);
 if(!Number.isFinite(value.autoBackupHours)||value.autoBackupHours<0)throw Error('Invalid autoBackupHours');
 if(process.env.PORT)value.port=Number(process.env.PORT);
 if(process.env.OTHOBA_HOST)value.host=process.env.OTHOBA_HOST;
 if(process.env.OTHOBA_DATA_DIR)value.dataDir=process.env.OTHOBA_DATA_DIR;
 if(process.env.OTHOBA_PUBLIC_ORIGIN)value.publicOrigin=process.env.OTHOBA_PUBLIC_ORIGIN;
 if(process.env.OTHOBA_SECURE_COOKIES)value.secureCookies=process.env.OTHOBA_SECURE_COOKIES==='true';
 if(process.env.OTHOBA_SEED)value.seedIncludedReports=process.env.OTHOBA_SEED==='true';
 value.dataDir=path.resolve(backendDir,value.dataDir);
 value.frontendDir=path.join(packageDir,'SalesDashboard');
 if(value.dataDir===value.frontendDir||value.dataDir.startsWith(value.frontendDir+path.sep))throw Error('dataDir must be outside the public SalesDashboard folder.');
 if(!Number.isInteger(value.port)||value.port<1||value.port>65535)throw Error('Invalid server port.');
 if(!Number.isFinite(value.sessionHours)||value.sessionHours<1||value.sessionHours>48)throw Error('sessionHours must be 1–48.');
 if(!['127.0.0.1','::1','localhost'].includes(value.host)&&!value.publicOrigin)throw Error('Set publicOrigin before binding the backend to a network interface.');
 if(value.publicOrigin){let u=new URL(value.publicOrigin);if(!['http:','https:'].includes(u.protocol))throw Error('Invalid publicOrigin.');value.allowedOrigin=u.origin;if(u.protocol==='https:')value.secureCookies=true;}
 fs.mkdirSync(value.dataDir,{recursive:true});
 return value;
}
