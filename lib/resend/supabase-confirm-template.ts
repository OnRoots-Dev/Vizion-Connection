// lib/resend/supabase-confirm-template.ts
// Supabase Auth「Confirm signup」テンプレートのソース（Management API 反映用）

import { buildSupabaseConfirmSignupTemplate } from "@/lib/resend/email-brand";

export const SUPABASE_CONFIRM_SIGNUP_SUBJECT =
  "【Vizion Connection】メールアドレスを確認してください";

export function getSupabaseConfirmSignupHtml(): string {
  return buildSupabaseConfirmSignupTemplate();
}
