// Short HTTP requests with idempotent job submission. Only the owning account
// can read a result. Jobs never contain passwords or session tokens.
import {randomUUID} from 'node:crypto';
export class Jobs {
 constructor(){this.items=new Map();this.keys=new Map();}
 cleanup(){for(const[id,j]of this.items)if(j.state!=='running'&&j.expires<Date.now()){this.items.delete(id);this.keys.delete(j.key);}}
 submit(actor,key,signature,run){this.cleanup();const lookup=actor+':'+key,old=this.keys.get(lookup);if(old){const j=this.items.get(old);if(j.signature!==signature)throw Object.assign(Error('This request ID belongs to another operation.'),{status:409});return j;}
  if(this.items.size>=8192)throw Object.assign(Error('The processing queue is full. Wait for current jobs to finish.'),{status:429});const j={id:randomUUID(),actor,key:lookup,signature,state:'running',createdAt:Date.now(),expires:Date.now()+1800000};this.items.set(j.id,j);this.keys.set(lookup,j.id);
  Promise.resolve().then(run).then(result=>{j.result=result;j.state='complete';j.expires=Date.now()+1800000;},e=>{j.error=e.message;j.status=e.status||500;j.code=e.code||'PROCESSING_FAILED';j.state='failed';j.expires=Date.now()+1800000;});return j;
 }
 get(actor,id){this.cleanup();const j=this.items.get(id);if(!j||j.actor!==actor)throw Object.assign(Error('Processing job expired or belongs to another account. Refresh the dashboard; committed data remains saved.'),{status:404});return j;}
 public(j){return {id:j.id,state:j.state,...(j.state==='complete'?{result:j.result?.file?{...j.result,file:undefined,download:'jobs/'+j.id+'/download'}:j.result}:{}),...(j.state==='failed'?{error:j.error,status:j.status,code:j.code}:{})};}
}
