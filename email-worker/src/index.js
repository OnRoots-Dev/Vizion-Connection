import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

const FROM_NAME = "Vizion Connection";
const FROM_EMAIL = "contact@vizion-connection.jp";
const FORWARD_TO = "kuro0921hiro@gmail.com";

function escapeHtml(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function buildAutoReplyHtml({ recipientEmail }) {
	const safeEmail = escapeHtml(recipientEmail);

	return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>お問い合わせを受け付けました</title>
</head>
<body style="margin:0;padding:0;background:#07070e;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070e;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
          <tr>
            <td style="padding:0 0 32px 0;" align="center">
              <img
                src="https://vizion-connection.jp/images/Vizion_Connection_logo-wt.png"
                alt="Vizion Connection"
                width="140"
                style="height:auto;display:block;opacity:0.85;"
              />
            </td>
          </tr>

          <tr>
            <td style="background:#0d0d18;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:3px;background:linear-gradient(90deg,#7c3aed,#3b82f6);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:40px 44px 36px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.3);">
                      Contact Reception
                    </p>
                    <h2 style="margin:0 0 24px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.01em;line-height:1.3;">
                      お問い合わせを<br />受け付けました
                    </h2>
                    <p style="margin:0 0 8px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.5);">
                      Vizion Connection へご連絡いただき、ありがとうございます。
                    </p>
                    <p style="margin:0 0 24px;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.5);">
                      内容を確認のうえ、担当者より順次ご連絡いたします。返信まで少しお時間をいただく場合があります。
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                      <tr>
                        <td style="border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);padding:16px 18px;">
                          <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.28);">
                            Reply Address
                          </p>
                          <p style="margin:0;font-size:14px;line-height:1.7;color:#ffffff;word-break:break-all;">
                            ${safeEmail}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                      <tr>
                        <td style="height:1px;background:rgba(255,255,255,0.06);font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                    </table>

                    <p style="margin:0 0 12px;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.25);">
                      このメールは自動送信です。心当たりがない場合は、そのまま破棄してください。
                    </p>
                    <p style="margin:0;font-size:11px;line-height:1.7;color:rgba(255,255,255,0.18);">
                      お急ぎの場合は、本メールにそのまま返信いただいても問題ありません。
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 44px 20px;border-top:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
                      © 2026 Vizion Connection. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function buildAutoReplyText() {
	return [
		"Vizion Connection へお問い合わせいただきありがとうございます。",
		"内容を確認のうえ、担当者より順次ご連絡いたします。",
		"",
		"このメールは自動送信です。心当たりがない場合は、そのまま破棄してください。",
	].join("\n");
}

export default {
	async email(message, env) {
		// Resendなど自動送信からのメールは無視して転送のみ
		if (message.from.endsWith("@send.vizion-connection.jp") ||
			message.from.includes("noreply") ||
			message.from.includes("no-reply")) {
			await message.forward(FORWARD_TO);
			return;
		}
		const msg = createMimeMessage();
		msg.setSender({ name: FROM_NAME, addr: FROM_EMAIL });
		msg.setRecipient(message.from);
		msg.setSubject("【Vizion Connection】お問い合わせを受け付けました");
		msg.addMessage({
			contentType: "text/plain",
			data: buildAutoReplyText(),
		});
		msg.addMessage({
			contentType: "text/html",
			data: buildAutoReplyHtml({ recipientEmail: message.from }),
		});

		const reply = new EmailMessage(FROM_EMAIL, message.from, msg.asRaw());
		await env.SEND_EMAIL.send(reply);

		await message.forward(FORWARD_TO);
	},
};
