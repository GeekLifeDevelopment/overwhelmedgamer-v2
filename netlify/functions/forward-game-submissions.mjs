import {createHmac,createHash} from 'node:crypto';

// This handler receives Netlify's own verified formSubmitted event.
// It only forwards game-related contact forms to the owner's private Hub.
const GAME_REASONS=new Set(['Indie game submission','Homebrew game submission','Review request']);
const FIELDS=['form-name','name','email','company','website','reason','platform','release_status','message','game_title'];

function sanitize(message){
  return String(message||'').replace(/\b[A-Z0-9]{4,6}(?:-[A-Z0-9]{4,6}){2,4}\b/gi,'[review key redacted]')
    .replace(/((?:review|steam|activation|license|download|redeem|access)\s*(?:code|key)\s*[:=\-]\s*)[^\s\r\n]+/gi,'$1[redacted]')
    .replace(/([?&](?:key|token|secret|access_token|code|password)=)[^&\s]+/gi,'$1[redacted]')
    .slice(0,1200);
}
export default {
  async formSubmitted(event){
    const form=event?.data;
    if(!form||typeof form!=='object')return;
    if(form['form-name']&&form['form-name']!=='contact')return;
    if(!GAME_REASONS.has(String(form.reason||'').trim()))return;
    const secret=process.env.OG_GAME_INTAKE_SHARED_SECRET;
    if(!secret||secret.length<32){
      console.error('Game form forwarder disabled: required secure connection is not configured.');
      return;
    }
    const safe={};
    for(const k of FIELDS)safe[k]=k==='message'?sanitize(form[k]):String(form[k]??'').slice(0,1500);
    // Netlify's form event guarantees verified field data, but currently doesn't
    // expose the original Netlify submission ID. Hash the exact normalized
    // fields to make event re-delivery idempotent across retries.
    const unique=createHash('sha256').update(JSON.stringify(safe)).digest('hex');
    const body=JSON.stringify({sourceId:unique,receivedAt:new Date().toISOString(),form:safe});
    const time=String(Date.now());
    const signed=createHmac('sha256',secret).update(time+'.'+body).digest('hex');
    const response=await fetch('https://hub.overwhelmedgamer.show/.netlify/functions/game-form-intake',{
      method:'POST',signal:AbortSignal.timeout(15000),
      headers:{
        'Content-Type':'application/json',
        'x-og-game-timestamp':time,
        'x-og-game-signature':'sha256='+signed
      },
      body
    });
    if(!response.ok){
      // Never print submission data, access credentials or raw error response.
      console.error('Game form forwarding failed; source submission retained in Netlify. Status:',response.status);
    }
  }
};
