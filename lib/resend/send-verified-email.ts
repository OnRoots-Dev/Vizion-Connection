// lib/resend/send-verified-email.ts

import { Resend } from "resend";
import { env } from "@/lib/env";
import { buildVerifiedWelcomeHtml } from "@/lib/resend/email-brand";

const resend = new Resend(env.RESEND_API_KEY);

interface SendVerifiedEmailInput {
  to: string;
  displayName: string;
  role: string;
  loginUrl: string;
}

export async function sendVerifiedEmail({
  to,
  displayName,
  role,
  loginUrl,
}: SendVerifiedEmailInput): Promise<void> {
  const html = buildVerifiedWelcomeHtml({ displayName, role, loginUrl });

  const { error } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to,
    subject: "【Vizion Connection】認証が完了しました",
    html,
  });

  if (error) {
    throw new Error(`Failed to send verified email: ${JSON.stringify(error)}`);
  }
}
