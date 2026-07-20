/**
 * Supabase Auth「Confirm signup」メールテンプレートをブランド版に更新する。
 * 実行: npx tsx scripts/update-supabase-confirm-email.ts
 * 要: SUPABASE_ACCESS_TOKEN
 */
import {
  getSupabaseConfirmSignupHtml,
  SUPABASE_CONFIRM_SIGNUP_SUBJECT,
} from "../lib/resend/supabase-confirm-template";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "qyeapzdwdkqmcsylkdfi";
const token = process.env.SUPABASE_ACCESS_TOKEN;

async function main() {
  if (!token) {
    console.error("SUPABASE_ACCESS_TOKEN is required");
    process.exit(1);
  }

  const html = getSupabaseConfirmSignupHtml();
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mailer_subjects_confirmation: SUPABASE_CONFIRM_SIGNUP_SUBJECT,
        mailer_templates_confirmation_content: html,
      }),
    },
  );

  const text = await res.text();
  if (!res.ok) {
    console.error("Failed:", res.status, text.slice(0, 800));
    process.exit(1);
  }

  console.log("OK: Confirm signup template updated");
  console.log("Subject:", SUPABASE_CONFIRM_SIGNUP_SUBJECT);
  console.log("HTML length:", html.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
