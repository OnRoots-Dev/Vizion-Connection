import { Resend } from "resend";
import { env } from "@/lib/env";
import { createContact } from "@/lib/supabase/contacts";

type ContactPayload = {
  category: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  /** お問い合わせ元のプラン（振込・請求書払い導線から渡される） */
  plan?: string;
};

const resend = new Resend(env.RESEND_API_KEY);
const CONTACT_TO = "contact@vizion-connection.jp";

// 銀行振込・請求書払いの対象プラン（Roots は対象外。Signal 以上のみ）。
const BANK_TRANSFER_PLANS: Record<string, { name: string; amountLabel: string }> = {
  signal: { name: "Signal", amountLabel: "¥100,000（税込）" },
  presence: { name: "Presence", amountLabel: "¥300,000（税込）" },
  legacy: { name: "Legacy", amountLabel: "個別見積（担当者よりご案内します）" },
};

// 振込期限：本メール送信日から起算した日数。
const BANK_TRANSFER_DUE_DAYS = 7;

function formatJstDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

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
  phone,
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
    <p style="margin:0 0 16px;"><strong>電話番号：</strong>${escapeHtml(phone || "-")}</p>
    <pre style="white-space:pre-wrap;word-break:break-word;background:#f6f6f8;border:1px solid #e5e5ea;padding:12px;border-radius:10px;line-height:1.6;">${escapeHtml(message)}</pre>
  </body>
</html>
  `.trim();
}

function buildAutoReplyHtml({
  category,
  name,
  phone,
  message,
}: Pick<ContactPayload, "category" | "name" | "phone" | "message">) {
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
      <p style="margin:0 0 8px;"><strong>電話番号：</strong>${escapeHtml(phone || "-")}</p>
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
  phone,
  message,
}: Pick<ContactPayload, "category" | "name" | "phone" | "message">) {
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
    `電話番号：${phone || "-"}`,
    "",
    message,
    "",
    "このメールは自動送信です。心当たりがない場合は、そのまま破棄してください。",
  ].join("\n");
}

type BankTransferContext = {
  name: string;
  planName: string;
  amountLabel: string;
  dueDate: string;
};

function buildBankTransferHtml({ name, planName, amountLabel, dueDate }: BankTransferContext) {
  return `
<!DOCTYPE html>
<html lang="ja">
  <body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;background:#ffffff;color:#111;">
    <h2 style="margin:0 0 16px;">お振込先のご案内</h2>
    <p style="margin:0 0 10px;line-height:1.8;">${escapeHtml(name)} 様</p>
    <p style="margin:0 0 10px;line-height:1.8;">このたびは Vizion Connection の ${escapeHtml(planName)} へお申し込みいただき、誠にありがとうございます。</p>
    <p style="margin:0 0 16px;line-height:1.8;">銀行振込でのお支払いをご希望とのこと、下記の通りお振込先をご案内いたします。</p>

    <div style="background:#f6f6f8;border:1px solid #e5e5ea;padding:14px;border-radius:10px;margin:0 0 16px;">
      <p style="margin:0 0 8px;font-weight:bold;">■ お申し込み内容</p>
      <p style="margin:0 0 4px;">プラン：${escapeHtml(planName)}</p>
      <p style="margin:0;">金額：${escapeHtml(amountLabel)}</p>
    </div>

    <div style="background:#f6f6f8;border:1px solid #e5e5ea;padding:14px;border-radius:10px;margin:0 0 16px;">
      <p style="margin:0 0 8px;font-weight:bold;">■ お振込先</p>
      <p style="margin:0 0 4px;">銀行名：${escapeHtml(env.BANK_NAME)}</p>
      <p style="margin:0 0 4px;">銀行コード：${escapeHtml(env.BANK_CODE)}</p>
      <p style="margin:0 0 4px;">支店名：${escapeHtml(env.BANK_BRANCH)}</p>
      <p style="margin:0 0 4px;">口座種別：${escapeHtml(env.BANK_ACCOUNT_TYPE)}</p>
      <p style="margin:0 0 4px;">店番号：${escapeHtml(env.BANK_BRANCH_CODE)}</p>
      <p style="margin:0 0 4px;">口座番号：${escapeHtml(env.BANK_ACCOUNT_NUMBER)}</p>
      <p style="margin:0;">口座名義：${escapeHtml(env.BANK_ACCOUNT_HOLDER)}</p>
    </div>

    <div style="background:#fff7ed;border:1px solid #fed7aa;padding:14px;border-radius:10px;margin:0 0 16px;">
      <p style="margin:0 0 6px;font-weight:bold;">■ お振込期限</p>
      <p style="margin:0;line-height:1.8;">本メール送信日から${BANK_TRANSFER_DUE_DAYS}日以内（${escapeHtml(dueDate)} まで）にお振込みください。</p>
    </div>

    <p style="margin:0 0 6px;font-weight:bold;">■ ご注意事項</p>
    <ul style="margin:0 0 16px;padding-left:1.2em;line-height:1.8;color:#333;">
      <li>振込手数料はお客様のご負担にてお願いいたします。</li>
      <li>お振込名義は「申込企業名」でお願いいたします。名義が異なる場合は本メールへのご返信にてお知らせください。</li>
      <li>ご入金を確認次第、担当者より掲載開始のご連絡を差し上げます（通常2〜3営業日以内）。</li>
      <li>請求書・領収書が必要な場合は本メールにご返信ください。</li>
    </ul>

    <p style="margin:0 0 16px;line-height:1.8;">ご不明な点がございましたら、本メールにそのままご返信ください。今後とも Vizion Connection をよろしくお願い申し上げます。</p>
    <hr style="border:none;border-top:1px solid #e5e5ea;margin:0 0 12px;" />
    <p style="margin:0 0 4px;color:#555;line-height:1.7;">Vizion Connection 運営事務局<br />contact@vizion-connection.jp<br />https://vizion-connection.jp</p>
    <p style="margin:8px 0 0;color:#999;font-size:12px;">※このメールは自動送信です。</p>
  </body>
</html>
  `.trim();
}

function buildBankTransferText({ name, planName, amountLabel, dueDate }: BankTransferContext) {
  return [
    `${name} 様`,
    "",
    `このたびは Vizion Connection の ${planName} へお申し込みいただき、誠にありがとうございます。`,
    "銀行振込でのお支払いをご希望とのこと、下記の通りお振込先をご案内いたします。",
    "",
    "■ お申し込み内容",
    `　プラン：${planName}`,
    `　金額　：${amountLabel}`,
    "",
    "■ お振込先",
    `　銀行名　：${env.BANK_NAME}`,
    `　銀行コード：${env.BANK_CODE}`,
    `　支店名　：${env.BANK_BRANCH}`,
    `　口座種別：${env.BANK_ACCOUNT_TYPE}`,
    `　店番号　：${env.BANK_BRANCH_CODE}`,
    `　口座番号：${env.BANK_ACCOUNT_NUMBER}`,
    `　口座名義：${env.BANK_ACCOUNT_HOLDER}`,
    "",
    "■ お振込期限",
    `　本メール送信日から${BANK_TRANSFER_DUE_DAYS}日以内（${dueDate} まで）にお振込みください。`,
    "",
    "■ ご注意事項",
    "　・振込手数料はお客様のご負担にてお願いいたします。",
    "　・お振込名義は「申込企業名」でお願いいたします。名義が異なる場合は本メールへのご返信にてお知らせください。",
    "　・ご入金を確認次第、担当者より掲載開始のご連絡を差し上げます（通常2〜3営業日以内）。",
    "　・請求書・領収書が必要な場合は本メールにご返信ください。",
    "",
    "ご不明な点がございましたら、本メールにそのままご返信ください。",
    "今後とも Vizion Connection をよろしくお願い申し上げます。",
    "",
    "────────────────",
    "Vizion Connection 運営事務局",
    "contact@vizion-connection.jp",
    "https://vizion-connection.jp",
    "────────────────",
    "※このメールは自動送信です。",
  ].join("\n");
}

export async function submitContact(payload: ContactPayload): Promise<void> {
  const { category, name, email, phone, message, plan } = payload;

  await createContact({ category, name, email, phone, message });

  const { error: notificationError } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to: CONTACT_TO,
    replyTo: email,
    subject: `【Vizion Connection】お問い合わせ：${category}`,
    html: buildContactNotificationHtml({ category, name, email, phone, message }),
  });

  if (notificationError) {
    console.error("[contact] resend notification mail error", notificationError);
  }

  // 振込・請求書払い対象プラン（Signal / Presence / Legacy）からの問い合わせには、
  // 汎用自動返信に代えて口座情報入りの振込案内メールを送信する。
  const bankPlan = plan ? BANK_TRANSFER_PLANS[plan] : null;

  if (bankPlan) {
    const dueDate = formatJstDate(
      new Date(Date.now() + BANK_TRANSFER_DUE_DAYS * 24 * 60 * 60 * 1000),
    );
    const ctx: BankTransferContext = {
      name,
      planName: bankPlan.name,
      amountLabel: bankPlan.amountLabel,
      dueDate,
    };
    const { error: bankTransferError } = await resend.emails.send({
      from: env.FROM_EMAIL,
      to: email,
      subject: `【Vizion Connection】お振込先のご案内（${bankPlan.name}）`,
      html: buildBankTransferHtml(ctx),
      text: buildBankTransferText(ctx),
    });

    if (bankTransferError) {
      console.error("[contact] resend bank transfer mail error", bankTransferError);
    }
    return;
  }

  const { error: autoReplyError } = await resend.emails.send({
    from: env.FROM_EMAIL,
    to: email,
    subject: "【Vizion Connection】お問い合わせありがとうございます",
    html: buildAutoReplyHtml({ category, name, phone, message }),
    text: buildAutoReplyText({ category, name, phone, message }),
  });

  if (autoReplyError) {
    console.error("[contact] resend auto reply mail error", autoReplyError);
  }
}
