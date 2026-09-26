import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
function loadEnv(){
  const c = readFileSync('.env.local','utf8');
  for(const l of c.split('\n')){
    const m=l.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/); if(!m) continue;
    let v=m[2].trim(); if((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v=v.slice(1,-1);
    if(!process.env[m[1].trim()]) process.env[m[1].trim()]=v;
  }
}
loadEnv();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false}});
const email='tumtragym622@gmail.com';
const { data, error } = await supabase.auth.admin.generateLink({ type:'magiclink', email, options:{ redirectTo: 'http://localhost:3000/auth/confirm' } });
console.log('error', error);
console.log('data', JSON.stringify(data,null,2));
if (data?.properties?.hashed_token) console.log('hashed_token', data.properties.hashed_token);
if (data?.properties?.action_link) console.log('action_link', data.properties.action_link);
