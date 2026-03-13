import { Resend } from "resend";
import { env } from "@/lib/env";

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
    const { error } = await resend.emails.send({
        from: env.FROM_EMAIL,
        to,
        subject: "【Vizion Connection】パスワードリセット",
        html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#07070e;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070e;padding:48px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        <tr><td style="padding:0 0 32px;" align="center">
          <img src="https://vizionconnection.com/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" width="140" style="height:auto;display:block;opacity:0.85;" />
        </td></tr>
        <tr><td style="background:#0d0d18;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
          <tr><td style="height:3px;background:#a78bfa;font-size:0;">&nbsp;</td></tr>
          <tr><td style="padding:40px 44px 36px;">
            <h2 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#fff;line-height:1.3;">
              パスワードをリセット
            </h2>
            <p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.5);">
              ${displayName} さん、パスワードリセットのリクエストを受け付けました。
            </p>
            <p style="margin:0 0 32px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.5);">
              下のボタンから新しいパスワードを設定してください。リンクは <strong style="color:rgba(255,255,255,0.7);">1時間</strong> 有効です。
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 36px;">
              <tr><td style="border-radius:10px;background:#a78bfa;box-shadow:0 0 24px rgba(167,139,250,0.4);">
                <a href="${resetUrl}" style="display:inline-block;padding:15px 36px;font-size:14px;font-weight:700;color:#000;text-decoration:none;letter-spacing:0.04em;border-radius:10px;">
                  パスワードをリセットする
                </a>
              </td></tr>
            </table>
            <p style="margin:0;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.25);">
              心当たりがない場合は無視してください。このリンクは1時間後に無効になります。
            </p>
            <p style="margin:12px 0 0;font-size:11px;line-height:1.7;color:rgba(255,255,255,0.18);word-break:break-all;">
              ${resetUrl}
            </p>
          </td></tr>
          <tr><td style="padding:16px 44px 20px;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">© 2026 Vizion Connection. All rights reserved.</p>
          </td></tr>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });
    if (error) throw new Error(`Failed to send reset email: ${JSON.stringify(error)}`);
}