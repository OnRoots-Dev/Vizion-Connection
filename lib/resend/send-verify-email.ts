// lib/resend/send-verify-email.ts

import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

interface SendVerifyEmailInput {
  to: string;
  displayName: string;
  verifyUrl: string;
}

export async function sendVerifyEmail({
  to,
  displayName,
  verifyUrl,
}: SendVerifyEmailInput): Promise<void> {
  const { error } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to,
    subject: "【Vizion Connection】メールアドレスを確認してください",
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>メールアドレスの確認</title>
</head>
<body style="margin:0;padding:0;background:#07070e;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070e;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding:0 0 32px 0;" align="center">
              <img src="https://vizion-connection.jp/images/Vizion_Connection_logo-wt.png"
                alt="Vizion Connection"
                width="140"
                style="height:auto;display:block;opacity:0.85;" />
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0d0d18;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">

              <!-- Card Top accent -->
              <tr>
                <td style="height:3px;background:linear-gradient(90deg,#7c3aed,#3b82f6);font-size:0;line-height:0;">&nbsp;</td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 44px 36px;">
                  <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);">
                    Email Verification
                  </p>
                  <h2 style="margin:0 0 24px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.01em;line-height:1.3;">
                    メールアドレスを<br />確認してください
                  </h2>
                  <p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.5);">
                    ${displayName} さん、Vizion Connection へのご登録ありがとうございます。
                  </p>
                  <p style="margin:0 0 36px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.5);">
                    下のボタンをクリックして、メールアドレスの確認を完了してください。
                  </p>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" style="margin:0 0 36px;">
                    <tr>
                      <td style="border-radius:10px;background:#7c3aed;box-shadow:0 0 24px rgba(124,58,237,0.4);">
                        <a href="${verifyUrl}"
                          style="display:inline-block;padding:15px 36px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.04em;border-radius:10px;">
                          メールアドレスを確認する
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Divider -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                    <tr>
                      <td style="height:1px;background:rgba(255,255,255,0.06);font-size:0;">&nbsp;</td>
                    </tr>
                  </table>

                  <p style="margin:0 0 12px;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.25);">
                    このリンクは <strong style="color:rgba(255,255,255,0.4);">24時間</strong> 有効です。心当たりがない場合は無視してください。
                  </p>
                  <p style="margin:0;font-size:11px;line-height:1.7;color:rgba(255,255,255,0.18);word-break:break-all;">
                    ボタンが機能しない場合はこちらのURLをブラウザに貼り付けてください：<br />
                    <span style="color:rgba(255,255,255,0.3);">${verifyUrl}</span>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:16px 44px 20px;border-top:1px solid rgba(255,255,255,0.05);">
                  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
                    © 2026 Vizion Connection. All rights reserved.
                  </p>
                </td>
              </tr>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verify email: ${JSON.stringify(error)}`);
  }
}