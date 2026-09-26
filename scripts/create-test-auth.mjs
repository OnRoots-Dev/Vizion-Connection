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
const password='TempTest123!@#';
console.log('Creating auth user for', email);
const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { slug: 'shoma_trampwall', role: 'Athlete' } });
console.log('create error', error);
console.log('create data', data?.user?.id);
if (data?.user?.id) {
  const authId = data.user.id;
  console.log('Linking public.users id=2 to auth_id', authId);
  const { error: updErr } = await supabase.from('users').update({ auth_id: authId }).eq('id', 2);
  console.log('update error', updErr);
  // verify
  const { data: pub } = await supabase.from('users').select('id, slug, auth_id').eq('id',2).single();
  console.log('pub after', pub);
  // try sign in to get session
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  // need anon key from env
  let anon = anonKey;
  if (!anon) {
    const c2 = readFileSync('.env.local','utf8');
    for(const l of c2.split('\n')) if(l.includes('ANON_KEY')) console.log(l);
  }
  // try sign in via supabase client with anon key
  const { createClient: createAnon } = await import('@supabase/supabase-js');
  const anonClient = createAnon(process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || anon);
  const { data: signData, error: signErr } = await anonClient.auth.signInWithPassword({ email, password });
  console.log('signIn error', signErr);
  console.log('signIn data session exists', !!signData?.session);
  if (signData?.session) {
    console.log('access_token len', signData.session.access_token.length);
    console.log('refresh_token len', signData.session.refresh_token.length);
    // save tokens for playwright
    import('fs').then(fs=>fs.writeFileSync('test-session.json', JSON.stringify({ access_token: signData.session.access_token, refresh_token: signData.session.refresh_token }, null, 2)));
    console.log('saved to test-session.json');
  }
}
