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
const { data: pub } = await supabase.from('users').select('id, slug, email, auth_id, is_founding_member').eq('id',2).single();
console.log('public.users id=2', pub);
if (pub?.auth_id) {
  const { data: authUser, error } = await supabase.auth.admin.getUserById(pub.auth_id);
  console.log('auth user by auth_id', authUser, error);
}
// also list by email
const { data: list } = await supabase.auth.admin.listUsers();
const found = list.users.filter(u=>u.email==='tumtragym622@gmail.com');
console.log('found by email', found.map(u=>({id:u.id,email:u.email,created_at:u.created_at})));
// also delete the accidentally created user from previous gen-magic (03847f41...)
const delId = '03847f41-bb5d-45c9-8d0a-b35bc9452181';
const { error: delErr } = await supabase.auth.admin.deleteUser(delId);
console.log('deleted accidental user', delId, delErr);
