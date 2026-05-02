import { Resend } from "resend";
import { env } from "@/lib/env";
import { createContact } from "@/lib/supabase/contacts";

type ContactPayload = {
  category: string;
  name: string;
  email: string;
  message: string;
};

const resend = new Resend(env.RESEND_API_KEY);
const CONTACT_TO = "contact@vizion-connection.jp";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildContactNotificationHtml({
  category,
  name,
  email,
  message,
}: ContactPayload) {
  return `
<!DOCTYPE html>
<html lang="ja">
  <body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;background:#ffffff;color:#111;">
    <h2 style="margin:0 0 16px;">お問い合わせを受け付けました</h2>
    <p style="margin:0 0 8px;"><strong>カテゴリ：</strong>${escapeHtml(category)}</p>
    <p style="margin:0 0 8px;"><strong>お名前：</strong>${escapeHtml(name)}</p>
    <p style="margin:0 0 16px;"><strong>メール：</strong>${escapeHtml(email)}</p>
    <pre style="white-space:pre-wrap;word-break:break-word;background:#f6f6f8;border:1px solid #e5e5ea;padding:12px;border-radius:10px;line-height:1.6;">${escapeHtml(message)}</pre>
  </body>
</html>
  `.trim();
}

function buildAutoReplyHtml({
  category,
  name,
  message,
}: Pick<ContactPayload, "category" | "name" | "message">) {
  return `
<!DOCTYPE html>
<html lang="ja">
  <body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;background:#ffffff;color:#111;">
    <h2 style="margin:0 0 16px;">お問い合わせありがとうございます</h2>
    <p style="margin:0 0 10px;line-height:1.8;">${escapeHtml(name)} 様</p>
    <p style="margin:0 0 10px;line-height:1.8;">Vizion Connection へお問い合わせいただき、ありがとうございます。</p>
    <p style="margin:0 0 8px;line-height:1.8;">内容を確認のうえ、担当者より順次ご連絡いたします。</p>
    <p style="margin:0 0 16px;line-height:1.8;">通常2〜3営業日以内にご返信いたします。</p>
    <div style="background:#f6f6f8;border:1px solid #e5e5ea;padding:14px;border-radius:10px;margin:0 0 16px;">
      <p style="margin:0 0 8px;"><strong>カテゴリ：</strong>${escapeHtml(category)}</p>
      <p style="margin:0 0 8px;"><strong>お名前：</strong>${escapeHtml(name)}</p>
      <p style="margin:0;"><strong>内容：</strong></p>
      <pre style="margin:8px 0 0;white-space:pre-wrap;word-break:break-word;line-height:1.6;">${escapeHtml(message)}</pre>
    </div>
    <p style="margin:0;line-height:1.8;color:#555;">このメールは自動送信です。心当たりがない場合は、そのまま破棄してください。</p>
  </body>
</html>
  `.trim();
}

function buildAutoReplyText({
  category,
  name,
  message,
}: Pick<ContactPayload, "category" | "name" | "message">) {
  return [
    `${name} 様`,
    "",
    "Vizion Connection へお問い合わせいただき、ありがとうございます。",
    "内容を確認のうえ、担当者より順次ご連絡いたします。",
    "通常2〜3営業日以内にご返信いたします。",
    "",
    "【お問い合わせ内容】",
    `カテゴリ：${category}`,
    `お名前：${name}`,
    "",
    message,
    "",
    "このメールは自動送信です。心当たりがない場合は、そのまま破棄してください。",
  ].join("\n");
}

export async function submitContact(payload: ContactPayload): Promise<void> {
  const { category, name, email, message } = payload;

  await createContact({ category, name, email, message });

  const { error: notificationError } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to: CONTACT_TO,
    replyTo: email,
    subject: `【Vizion Connection】お問い合わせ：${category}`,
    html: buildContactNotificationHtml({ category, name, email, message }),
  });

  if (notificationError) {
    console.error("[contact] resend notification mail error", notificationError);
  }

  const { error: autoReplyError } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to: email,
    subject: "【Vizion Connection】お問い合わせありがとうございます",
    html: buildAutoReplyHtml({ category, name, message }),
    text: buildAutoReplyText({ category, name, message }),
  });

  if (autoReplyError) {
    console.error("[contact] resend auto reply mail error", autoReplyError);
  }
}
