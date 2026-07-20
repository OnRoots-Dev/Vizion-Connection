// lib/resend/email-brand.ts
// Vizion Connection ブランド統一メールシェル（Resend / Supabase Auth 共通）

export const EMAIL_BRAND = {
  bg: "#07070e",
  card: "#0d0d14",
  electric: "#C8E800",
  electricGlow: "rgba(200,232,0,0.35)",
  flame: "#ff6b00",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.52)",
  faint: "rgba(255,255,255,0.28)",
  border: "rgba(255,255,255,0.08)",
  logoUrl: "https://vizion-connection.jp/images/Vizion_Connection_logo-wt.png",
  siteUrl: "https://vizion-connection.jp",
  fromLabel: "Vizion Connection",
} as const;

export const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  Athlete: { label: "Athlete", color: "#FF5050" },
  Trainer: { label: "Trainer", color: "#32D278" },
  Business: { label: "Business", color: "#3C8CFF" },
  Crew: { label: "Crew", color: "#FFC81E" },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * ブランド統一メール HTML を組み立てる。
 * Supabase テンプレートでは url に `{{ .ConfirmationURL }}` をそのまま渡す（エスケープしない）。
 */
export function buildBrandEmailHtml(opts: {
  title: string;
  eyebrow?: string;
  paragraphs: string[];
  /** CTA。Supabase 用は url に Go template を直接入れる */
  cta?: { label: string; url: string };
  footerNote?: string;
  /** 追加のインライン HTML（バッジ等）。信頼できる内部生成のみ */
  accentHtml?: string;
  /** CTA ボタン色（未指定は electric） */
  ctaColor?: string;
  /** 本文中の生 HTML を許可（テンプレート変数用） */
  allowRawUrls?: boolean;
}): string {
  const {
    title,
    eyebrow = "VIZION CONNECTION",
    paragraphs,
    cta,
    footerNote,
    accentHtml = "",
    ctaColor = EMAIL_BRAND.electric,
    allowRawUrls = false,
  } = opts;

  const bodyParas = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:14px;line-height:1.8;color:${EMAIL_BRAND.muted};">${p}</p>`,
    )
    .join("");

  const ctaBlock = cta
    ? `
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:8px 0 32px;">
                    <tr>
                      <td style="border-radius:12px;background:${ctaColor};box-shadow:0 0 28px ${EMAIL_BRAND.electricGlow};">
                        <a href="${allowRawUrls ? cta.url : escapeHtml(cta.url)}"
                          style="display:inline-block;padding:15px 32px;font-size:14px;font-weight:800;color:#0a0a0a;text-decoration:none;letter-spacing:0.02em;border-radius:12px;">
                          ${escapeHtml(cta.label)}
                        </a>
                      </td>
                    </tr>
                  </table>`
    : "";

  const footer = footerNote
    ? `<p style="margin:0 0 8px;font-size:12px;line-height:1.7;color:${EMAIL_BRAND.faint};">${footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_BRAND.bg};font-family:'Helvetica Neue',Arial,'Hiragino Sans','Noto Sans JP',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${EMAIL_BRAND.bg};padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;width:100%;">
          <tr>
            <td style="padding:0 0 28px;" align="center">
              <img src="${EMAIL_BRAND.logoUrl}" alt="Vizion Connection" width="160" style="height:auto;display:block;opacity:0.9;" />
            </td>
          </tr>
          <tr>
            <td style="background:${EMAIL_BRAND.card};border:1px solid ${EMAIL_BRAND.border};border-radius:20px;overflow:hidden;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="height:3px;background:${EMAIL_BRAND.electric};font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <p style="margin:0 0 16px;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${EMAIL_BRAND.electric};font-family:ui-monospace,Menlo,monospace;">
                      ${escapeHtml(eyebrow)}
                    </p>
                    ${accentHtml}
                    <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:${EMAIL_BRAND.text};letter-spacing:-0.02em;line-height:1.35;">
                      ${title}
                    </h1>
                    ${bodyParas}
                    ${ctaBlock}
                    ${footer}
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 40px 20px;border-top:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.22);">
                      © ${new Date().getFullYear()} Vizion Connection ·
                      <a href="${EMAIL_BRAND.siteUrl}" style="color:rgba(255,255,255,0.35);text-decoration:none;">vizion-connection.jp</a>
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
</html>`;
}

/**
 * Supabase Auth「Confirm signup」用 HTML（Go template 変数を含む）
 *
 * {{ .ConfirmationURL }} は検証後にセッションを URL fragment で返すため、
 * SSR の /auth/confirm（Route Handler）では受け取れない。
 * サーバー側 verifyOtp 用に token_hash をクエリで直渡しする（公式 SSR 推奨）。
 * @see https://supabase.com/docs/guides/auth/auth-email-templates#redirecting-the-user-to-a-server-side-endpoint
 */
export function buildSupabaseConfirmSignupTemplate(): string {
  return buildBrandEmailHtml({
    title: "メールアドレスを確認してください",
    eyebrow: "EMAIL VERIFICATION",
    paragraphs: [
      "Vizion Connection へのご登録ありがとうございます。",
      "下のボタンを押すとメール認証が完了し、Pulse を始められます。",
      "このメールに心当たりがない場合は、破棄していただいて構いません。",
    ],
    cta: {
      label: "メールを確認する",
      // type=signup: 新規登録のメール確認。handler 側でも email をフォールバックする
      url: "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup",
    },
    footerNote:
      "リンクの有効期限が切れている場合は、ログイン画面または登録画面から認証メールを再送してください。",
    allowRawUrls: true,
  });
}

export function buildVerifiedWelcomeHtml(input: {
  displayName: string;
  role: string;
  loginUrl: string;
}): string {
  const roleInfo = ROLE_LABEL[input.role] ?? { label: input.role, color: EMAIL_BRAND.electric };
  const name = input.displayName?.trim() || "あなた";
  const accentHtml = `
                    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 18px;">
                      <tr>
                        <td style="border-radius:8px;padding:5px 12px;background:${roleInfo.color}18;border:1px solid ${roleInfo.color}40;">
                          <span style="font-size:10px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${roleInfo.color};">
                            ${escapeHtml(roleInfo.label)}
                          </span>
                        </td>
                      </tr>
                    </table>`;

  return buildBrandEmailHtml({
    title: "認証が完了しました",
    eyebrow: "WELCOME TO PULSE",
    paragraphs: [
      `${escapeHtml(name)} さん、メール認証へのご協力ありがとうございます。`,
      "アカウントの本登録が完了しました。アプリを開くときは、下のボタンからログインしてください。",
      "紹介リンクから友人が登録すると、双方に 500 ポイントが付与されます。",
    ],
    accentHtml,
    cta: {
      label: "ログインする",
      url: input.loginUrl,
    },
    footerNote:
      "このメールは認証完了時に自動送信されています。セキュリティのため、このメールからのアクセスはログインが必要です。",
    ctaColor: EMAIL_BRAND.electric,
  });
}

/** パスワードリセット依頼メール */
export function buildPasswordResetRequestHtml(input: {
  displayName: string;
  resetUrl: string;
}): string {
  const name = input.displayName?.trim() || "あなた";
  return buildBrandEmailHtml({
    title: "パスワードをリセット",
    eyebrow: "PASSWORD RESET",
    paragraphs: [
      `${escapeHtml(name)} さん、パスワードリセットのリクエストを受け付けました。`,
      '下のボタンから新しいパスワードを設定してください。リンクは <strong style="color:rgba(255,255,255,0.7);">1時間</strong> 有効です。',
      "心当たりがない場合は、このメールを無視してください。パスワードは変更されません。",
    ],
    cta: {
      label: "パスワードを再設定する",
      url: input.resetUrl,
    },
    footerNote: "このリンクは1時間後に無効になります。期限切れの場合は、ログイン画面から再度お手続きください。",
  });
}

/** パスワード再設定完了メール */
export function buildPasswordChangedHtml(input: {
  displayName: string;
  loginUrl: string;
}): string {
  const name = input.displayName?.trim() || "あなた";
  return buildBrandEmailHtml({
    title: "パスワードを変更しました",
    eyebrow: "SECURITY NOTICE",
    paragraphs: [
      `${escapeHtml(name)} さん、パスワードの再設定が完了しました。`,
      "新しいパスワードでログインできます。心当たりがない場合は、すぐにサポートへご連絡のうえ、パスワードを再度変更してください。",
    ],
    cta: {
      label: "ログインする",
      url: input.loginUrl,
    },
    footerNote: "このメールはパスワード変更完了時に自動送信されています。",
  });
}
