import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),source=path.join(root,'frontend-src'),output=path.join(root,'SalesDashboard');
const digest=text=>createHash('sha256').update(text).digest('hex').slice(0,12);
for(const folder of ['static/js','static/css'])fs.mkdirSync(path.join(output,folder),{recursive:true});
for(const folder of ['static/js','static/css'])for(const file of fs.readdirSync(path.join(output,folder)))if(/^(?:main|app|engine|packed|worker)(?:\.[a-f0-9]{12})?\.(js|css)$/.test(file))fs.unlinkSync(path.join(output,folder,file));
const combinedApp=fs.readFileSync(path.join(source,'dashboard-app.js'),'utf8')+'\n'+fs.readFileSync(path.join(source,'server-bridge.js'),'utf8')+'\ninit();\n';
let index=fs.readFileSync(path.join(source,'index.html'),'utf8'),assets={},files={};
for(const name of ['packed','engine','worker','app']){const content=name==='app'?combinedApp:fs.readFileSync(path.join(source,name+'.js'),'utf8'),filename=(name==='app'?'main':name)+'.'+digest(content)+'.js',relative='static/js/'+filename;fs.writeFileSync(path.join(output,relative),content);assets[name+'.js']='./'+relative;files[(name==='app'?'main':name)+'.js']=relative;index=index.replace('./static/js/'+name+'.js','./'+relative);}
const css=fs.readFileSync(path.join(source,'style.css'),'utf8'),cssName='static/css/main.'+digest(css)+'.css';fs.writeFileSync(path.join(output,cssName),css);index=index.replace('./static/css/main.css','./'+cssName);files['main.css']=cssName;
const settings=JSON.parse(fs.readFileSync(path.join(source,'app-settings.json'),'utf8'));fs.writeFileSync(path.join(output,'app-config.js'),'window.APP_CONFIG = '+JSON.stringify({...settings,assets},null,2)+';\n');
fs.writeFileSync(path.join(output,'index.html'),index);
fs.writeFileSync(path.join(output,'asset-manifest.json'),JSON.stringify({files:{...files,'index.html':'index.html','app-config.js':'app-config.js'},entrypoints:[cssName,...Object.values(assets).map(x=>x.replace(/^\.\//,''))]},null,2)+'\n');
fs.copyFileSync(path.join(source,'worker.js'),path.join(root,'backend/shared/worker.js'));
for(const name of ['packed','engine'])fs.copyFileSync(path.join(source,name+'.js'),path.join(root,'backend/shared',name+'.cjs'));
console.log('Built SalesDashboard assets, manifests and shared server calculations.');
