// lib/resend/send-password-changed-email.ts
// パスワード再設定完了メール（ブランド共通シェル）

import { Resend } from "resend";
import { env } from "@/lib/env";
import { buildPasswordChangedHtml } from "@/lib/resend/email-brand";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendPasswordChangedEmail({
  to,
  displayName,
  loginUrl,
}: {
  to: string;
  displayName: string;
  loginUrl: string;
}): Promise<void> {
  const html = buildPasswordChangedHtml({ displayName, loginUrl });

  const { error } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to,
    subject: "【Vizion Connection】パスワードを変更しました",
    html,
  });

  if (error) {
    throw new Error(`Failed to send password-changed email: ${JSON.stringify(error)}`);
  }
}
