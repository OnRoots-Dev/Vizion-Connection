/**
 * Supabase Auth の確認メール関連設定を確認する
 * 実行: npx tsx scripts/inspect-auth-confirm-config.ts
 */
import { getSupabaseConfirmSignupHtml } from "../lib/resend/supabase-confirm-template";

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "qyeapzdwdkqmcsylkdfi";
const token = process.env.SUPABASE_ACCESS_TOKEN;

async function main() {
  console.log("=== Local env ===");
  console.log("NEXT_PUBLIC_BASE_URL =", process.env.NEXT_PUBLIC_BASE_URL ?? "(unset)");
  console.log(
    "emailRedirectTo base =",
    `${process.env.NEXT_PUBLIC_BASE_URL ?? "(MISSING)"}/auth/confirm`,
  );

  const localHtml = getSupabaseConfirmSignupHtml();
  console.log("\n=== Local template source ===");
  console.log("has {{ .ConfirmationURL }}:", localHtml.includes("{{ .ConfirmationURL }}"));
  console.log("has TokenHash:", localHtml.includes("TokenHash"));
  const localHref = localHtml.match(/href="([^"]+)"/g);
  console.log("href attrs:", localHref);

  if (!token) {
    console.error("\nSUPABASE_ACCESS_TOKEN missing — skip remote fetch");
    process.exit(1);
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    console.error("fetch failed", res.status, data);
    process.exit(1);
  }

  const content = String(data.mailer_templates_confirmation_content ?? "");
  console.log("\n=== Live Supabase Auth config ===");
  console.log("site_url:", data.site_url);
  console.log("uri_allow_list:", data.uri_allow_list);
  console.log("mailer_subjects_confirmation:", data.mailer_subjects_confirmation);
  console.log("has ConfirmationURL:", content.includes("ConfirmationURL"));
  console.log("has TokenHash:", content.includes("TokenHash"));
  console.log("has {{ .Token }}:", content.includes("{{ .Token"));
  console.log("hrefs:", content.match(/href="([^"]+)"/g));
  console.log("\n--- template preview (first 1200 chars) ---");
  console.log(content.slice(0, 1200));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
