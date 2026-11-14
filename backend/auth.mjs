import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import path from 'node:path';
const derive=promisify(scrypt);
export const hashToken=t=>createHash('sha256').update(t).digest('hex');
export async function passwordHash(password,salt=randomBytes(16).toString('hex')){const digest=await derive(password,salt,64,{N:32768,r:8,p:1,maxmem:128*1024*1024});return `scrypt$32768$${salt}$${Buffer.from(digest).toString('hex')}`;}
export async function passwordMatches(password,encoded){const parts=String(encoded).split('$');if(parts.length!==4||parts[0]!=='scrypt'||parts[1]!=='32768')return false;const actual=Buffer.from((await passwordHash(password,parts[2])).split('$')[3],'hex'),expected=Buffer.from(parts[3],'hex');return actual.length===expected.length&&timingSafeEqual(actual,expected);}
export function openAuth(config){
 const db=new DatabaseSync(path.join(config.dataDir,'auth.sqlite'),{timeout:5000});
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','viewer')),active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expires_at INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);`);
 return db;
}
export async function addUser(db,username,password,role='viewer'){
 if(typeof username!=='string')throw Error('A username is required.');
 username=username.trim().toLowerCase();
 if(!/^[a-z0-9][a-z0-9._@-]{2,99}$/.test(username))throw Error('Username must be 3–100 letters, numbers, dots, @, underscores or hyphens.');
 if(typeof password!=='string'||password.length<12||password.length>256)throw Error('Use a password of 12–256 characters.');
 if(!['admin','viewer'].includes(role))throw Error('Role must be admin or viewer.');
 const hash=await passwordHash(password);
 const result=db.prepare('INSERT INTO users(username,password_hash,role,created_at) VALUES(?,?,?,?)').run(username,hash,role,new Date().toISOString());
 return {id:Number(result.lastInsertRowid),username,role};
}
export function sessionFor(db,token){if(!token)return null;return db.prepare('SELECT users.id,users.username,users.role,sessions.csrf,sessions.expires_at FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>? AND users.active=1').get(hashToken(token),Date.now())||null;}
export function createSession(db,user,config){const token=randomBytes(32).toString('base64url'),csrf=randomBytes(24).toString('base64url'),expires=Date.now()+config.sessionHours*3600000;db.prepare('DELETE FROM sessions WHERE expires_at<?').run(Date.now());db.prepare('INSERT INTO sessions(token_hash,user_id,csrf,expires_at) VALUES(?,?,?,?)').run(hashToken(token),user.id,csrf,expires);return {token,csrf,expires};}
export function safeEqual(a,b){if(typeof a!=='string'||typeof b!=='string')return false;const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb);}
