// Rebuild the shared download one partition at a time. Column spools bound memory;
// the full historical Store and one giant JSON/base64 string are never allocated.
import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync,createGzip} from 'node:zlib';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import Packed from './shared/packed.cjs';
export async function writeSnapshot(db,registry,empty,file){
 const directory=fs.mkdtempSync(path.join(path.dirname(file),'columns-')),columns=new Map(),metadata=db.prepare('SELECT stream,event_date,row_count FROM partitions ORDER BY event_date,stream').all();
 let count=0;
 try{
  for(const [key,c] of Object.entries(empty.packed.columns))columns.set(key,{path:path.join(directory,key+'.bin'),fd:fs.openSync(path.join(directory,key+'.bin'),'w',0o600),...(c.dict?{dict:[''],map:new Map([['',0]])}:{integer:true,min:0,max:0})});
  for(const part of metadata){const source=db.prepare('SELECT packed_gzip FROM partitions WHERE stream=? AND event_date=?').get(part.stream,part.event_date),store=Packed.state(JSON.parse(gunzipSync(source.packed_gzip))).store;count+=store.n;
   for(const [key,out] of columns){const c=store.columns[key];if(!c)throw Error('Saved partition missing '+key);let values;
    if(out.dict){let tr=c.dict.map(value=>{if(!out.map.has(value)){out.map.set(value,out.dict.length);out.dict.push(value);}return out.map.get(value);});values=new Uint32Array(store.n);for(let i=0;i<store.n;i++)values[i]=tr[c.values[i]];}
    else{values=Float64Array.from(c.values);for(const v of values){out.integer=out.integer&&Number.isInteger(v);out.min=Math.min(out.min,v);out.max=Math.max(out.max,v);}}
    fs.writeFileSync(out.fd,new Uint8Array(values.buffer));
   }
   await new Promise(resolve=>setImmediate(resolve));
  }
  for(const c of columns.values()){fs.closeSync(c.fd);c.fd=null;c.map=null;}
  async function* json(){yield '{"version":2,"packed":{"n":'+count+',"columns":{';let first=true;
   for(const [key,c] of columns){let type=c.dict?(c.dict.length<=256?'u8':c.dict.length<=65536?'u16':'u32'):(c.integer&&c.min>=0&&c.max<=4294967295?'u32':c.integer&&c.min>=-2147483648&&c.max<=2147483647?'i32':'f64'),C={u8:Uint8Array,u16:Uint16Array,u32:Uint32Array,i32:Int32Array,f64:Float64Array}[type];
    yield (first?'':',')+JSON.stringify(key)+':'+JSON.stringify({type,...(c.dict?{dict:c.dict}:{})}).slice(0,-1)+',"values":"';first=false;
    let carry=Buffer.alloc(0);for await(const chunk of fs.createReadStream(c.path,{highWaterMark:49152})){const raw=Uint8Array.from(chunk),input=c.dict?new Uint32Array(raw.buffer):new Float64Array(raw.buffer),converted=C.from(input),bytes=Buffer.concat([carry,Buffer.from(converted.buffer)]),end=bytes.length-bytes.length%3;if(end)yield bytes.subarray(0,end).toString('base64');carry=bytes.subarray(end);}
    if(carry.length)yield carry.toString('base64');yield '"}';
   }
   yield '}}';for(const key of ['imports','targets','targetImports','updatedAt'])yield ','+JSON.stringify(key)+':'+JSON.stringify(registry[key]);yield '}';
  }
  await pipeline(Readable.from(json()),createGzip({level:6}),fs.createWriteStream(file+'.tmp',{mode:0o600}));fs.renameSync(file+'.tmp',file);
 }finally{for(const c of columns.values())if(c.fd!==null)fs.closeSync(c.fd);fs.rmSync(directory,{recursive:true,force:true});fs.rmSync(file+'.tmp',{force:true});}
}
