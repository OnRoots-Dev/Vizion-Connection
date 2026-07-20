// Browser-safe Supabase client（RLS 適用の読み取り等）。
// 認証セッションは Cookie 共有のため @supabase/ssr の createClient（client.ts）を使うこと。
// ここでは localStorage 永続化を切り、Cookie セッションと二重管理しない。
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabaseBrowser = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
