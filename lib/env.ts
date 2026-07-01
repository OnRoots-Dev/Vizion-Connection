// lib/env.ts

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string): string {
  return process.env[key] ?? "";
}

export const env = {
  // Supabase（サーバーサイド）
  SUPABASE_URL: requireEnv("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),

  // Email
  RESEND_API_KEY: requireEnv("RESEND_API_KEY"),
  FROM_EMAIL: process.env.FROM_EMAIL ?? "noreply@vizion-connection.jp",

  // App
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? "https://app.vizion-connection.jp",
  VOICELAB_ADMIN_EMAILS: optionalEnv("VOICELAB_ADMIN_EMAILS"),

  // Square（決済リンク）- 遅延評価のためoptional
  SQUARE_LINK_ENTRY_SUPPORTER: optionalEnv("SQUARE_LINK_ENTRY_SUPPORTER"),
  SQUARE_LINK_STARTER_POSITION: optionalEnv("SQUARE_LINK_STARTER_POSITION"),
  SQUARE_LINK_IMPACT_PARTNER: optionalEnv("SQUARE_LINK_IMPACT_PARTNER"),
  SQUARE_LINK_PRIME_SPONSOR: optionalEnv("SQUARE_LINK_PRIME_SPONSOR"),
  SQUARE_LINK_CHAMPION_PARTNER: optionalEnv("SQUARE_LINK_CHAMPION_PARTNER"),
  SQUARE_WEBHOOK_SIGNATURE_KEY: optionalEnv("SQUARE_WEBHOOK_SIGNATURE_KEY"),

  // Upstash Redis（rate limiting）
  UPSTASH_REDIS_REST_URL: requireEnv("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: requireEnv("UPSTASH_REDIS_REST_TOKEN"),

  // 銀行振込案内メールの口座情報（ダミー初期値。実値は環境変数で上書きする）
  BANK_NAME: process.env.BANK_NAME ?? "○○銀行",
  BANK_BRANCH: process.env.BANK_BRANCH ?? "○○支店",
  BANK_ACCOUNT_TYPE: process.env.BANK_ACCOUNT_TYPE ?? "普通",
  BANK_ACCOUNT_NUMBER: process.env.BANK_ACCOUNT_NUMBER ?? "0000000",
  BANK_ACCOUNT_HOLDER: process.env.BANK_ACCOUNT_HOLDER ?? "カ）ビジョンコネクション",
};
