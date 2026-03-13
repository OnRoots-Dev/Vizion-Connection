// lib/resend/send-verified-email.ts

import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

interface SendVerifiedEmailInput {
    to: string;
    displayName: string;
    role: string;
    loginUrl: string;
}

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
    Athlete: { label: "Athlete", color: "#FF5050" },
    Trainer: { label: "Trainer", color: "#32D278" },
    Business: { label: "Business", color: "#3C8CFF" },
    Members: { label: "Members", color: "#FFC81E" },
};

export async function sendVerifiedEmail({
    to,
    displayName,
    role,
    loginUrl,
}: SendVerifiedEmailInput): Promise<void> {
    const roleInfo = ROLE_LABEL[role] ?? { label: role, color: "#a78bfa" };

    const { error } = await resend.emails.send({
        from: env.FROM_EMAIL,
        to,
        subject: "【Vizion Connection】先行登録が完了しました",
        html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>登録完了</title>
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

              <!-- Role color accent -->
              <tr>
                <td style="height:3px;background:${roleInfo.color};font-size:0;line-height:0;">&nbsp;</td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 44px 36px;">

                  <!-- Role badge -->
                  <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                    <tr>
                      <td style="border-radius:6px;padding:4px 12px;background:${roleInfo.color}18;border:1px solid ${roleInfo.color}40;">
                        <span style="font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${roleInfo.color};">
                          ${roleInfo.label}
                        </span>
                      </td>
                    </tr>
                  </table>

                  <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.01em;line-height:1.3;">
                    先行登録が<br />完了しました 🎉
                  </h2>
                  <p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.5);">
                    ${displayName} さん、Vizion Connection への先行登録ありがとうございます。
                  </p>
                  <p style="margin:0 0 36px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.5);">
                    ダッシュボードにログインして、あなたのプロフィールを確認しましょう。
                  </p>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" style="margin:0 0 36px;">
                    <tr>
                      <td style="border-radius:10px;background:${roleInfo.color};box-shadow:0 0 24px ${roleInfo.color}50;">
                        <a href="${loginUrl}"
                          style="display:inline-block;padding:15px 36px;font-size:14px;font-weight:700;color:#000000;text-decoration:none;letter-spacing:0.04em;border-radius:10px;">
                          ダッシュボードへ
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Divider -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                    <tr>
                      <td style="height:1px;background:rgba(255,255,255,0.06);font-size:0;">&nbsp;</td>
                    </tr>
                  </table>

                  <p style="margin:0;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.25);">
                    紹介リンクをシェアして友人を招待すると、双方に <strong style="color:rgba(255,255,255,0.4);">500ポイント</strong> が付与されます。ダッシュボードから紹介リンクを確認できます。
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
        throw new Error(`Failed to send verified email: ${JSON.stringify(error)}`);
    }
}