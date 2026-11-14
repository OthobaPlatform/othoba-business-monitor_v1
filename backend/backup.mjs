import { DatabaseSync } from 'node:sqlite';
import { readConfig } from './config.mjs';
import fs from 'node:fs';
import path from 'node:path';
const config=readConfig(),target=path.resolve(process.argv[2]||path.join(config.dataDir,'backups')),stamp=new Date().toISOString().replace(/[:.]/g,'-');
fs.mkdirSync(target,{recursive:true});
for(const name of ['sales','auth']){const source=path.join(config.dataDir,name+'.sqlite');if(!fs.existsSync(source))throw Error(source+' does not exist.');const db=new DatabaseSync(source,{timeout:10000});try{db.prepare('VACUUM INTO ?').run(path.join(target,name+'-'+stamp+'.sqlite'));}finally{db.close();}}
console.log('Consistent SQLite snapshots saved to '+target);
