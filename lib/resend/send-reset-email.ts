// lib/resend/send-reset-email.ts
// パスワードリセット依頼メール（ブランド共通シェル）

import { Resend } from "resend";
import { env } from "@/lib/env";
import { buildPasswordResetRequestHtml } from "@/lib/resend/email-brand";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendResetEmail({
  to,
  displayName,
  resetUrl,
}: {
  to: string;
  displayName: string;
  resetUrl: string;
}): Promise<void> {
  const html = buildPasswordResetRequestHtml({ displayName, resetUrl });

  const { error } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to,
    subject: "【Vizion Connection】パスワードを再設定してください",
    html,
  });

  if (error) {
    throw new Error(`Failed to send reset email: ${JSON.stringify(error)}`);
  }
}
