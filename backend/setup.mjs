import readline from 'node:readline/promises';
import { stdin,stdout } from 'node:process';
import { readConfig } from './config.mjs';
import { openAuth,addUser } from './auth.mjs';
async function hidden(question){
 if(!stdin.isTTY)throw Error('Run setup in an interactive terminal. Passwords are never read from command arguments.');
 stdout.write(question);stdin.setRawMode(true);stdin.resume();stdin.setEncoding('utf8');
 return new Promise((resolve,reject)=>{let input='';function done(){stdin.off('data',read);stdin.setRawMode(false);stdin.pause();stdout.write('\n');}function read(chunk){for(const c of chunk){if(c==='\u0003'){done();reject(Error('Cancelled'));return;}if(c==='\r'||c==='\n'){done();resolve(input);return;}if(c==='\u007f'||c==='\b'){input=input.slice(0,-1);continue;}if(c>=' '&&input.length<256)input+=c;}}stdin.on('data',read);});
}
const config=readConfig(),db=openAuth(config);try{
 const add=process.argv.includes('--add-user'),count=db.prepare('SELECT count(*) AS n FROM users WHERE role=\'admin\' AND active=1').get().n;
 if(!add&&count)throw Error('An administrator already exists. Use npm run create-user to add another account.');
 const rl=readline.createInterface({input:stdin,output:stdout});const username=await rl.question('Username: ');let role=add?(await rl.question('Role (admin/viewer) [viewer]: ')).trim()||'viewer':'admin';rl.close();
 const password=await hidden('Password (at least 12 characters, hidden): '),confirm=await hidden('Repeat password: ');if(password!==confirm)throw Error('Passwords do not match.');
 const user=await addUser(db,username,password,role);console.log(`Created ${user.role} account: ${user.username}`);
}catch(error){console.error(error.message);process.exitCode=1;}finally{db.close();}
