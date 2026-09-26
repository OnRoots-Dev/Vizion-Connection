import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  try {
    const content = readFileSync('.env.local', 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const k = m[1].trim();
      let v = m[2].trim();
      // remove quotes
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1,-1);
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {}
}
loadEnv();
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('URL exists:', !!url);
console.log('KEY exists:', !!key);
if (!url || !key) { console.error('missing env'); process.exit(1); }
const supabase = createClient(url, key, { auth: { persistSession: false } });
const { data: user, error } = await supabase.from('users').select('id, slug, display_name, email, is_founding_member, serial_id').eq('id', 2).maybeSingle();
console.log('user id=2:', user);
console.log('error:', error);
if (user) {
  // also get referrals for this slug
  const { data: ref } = await supabase.from('referrals').select('*').eq('referrer_slug', user.slug).limit(3);
  console.log('referrals sample:', ref?.slice(0,2));
  // check og referral endpoint expects slug?
  console.log('slug for /api/og/referral:', user.slug);
}
// also check next ids
const { data: nextUsers } = await supabase.from('users').select('id, slug').in('id', [2,232,233,234]).order('id');
console.log('next users:', nextUsers);
