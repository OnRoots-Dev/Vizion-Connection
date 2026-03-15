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
  // Supabase
  SUPABASE_URL:              requireEnv("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),

  // Auth
  SESSION_SECRET:       requireEnv("SESSION_SECRET"),

  // Email
  RESEND_API_KEY:       requireEnv("RESEND_API_KEY"),
  FROM_EMAIL:           process.env.FROM_EMAIL ?? "noreply@vizion-connection.jp",

  // App
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",

  // Square（決済リンク）- 遅延評価のためoptional
  SQUARE_LINK_ENTRY_SUPPORTER:   optionalEnv("SQUARE_LINK_ENTRY_SUPPORTER"),
  SQUARE_LINK_STARTER_POSITION:  optionalEnv("SQUARE_LINK_STARTER_POSITION"),
  SQUARE_LINK_IMPACT_PARTNER:    optionalEnv("SQUARE_LINK_IMPACT_PARTNER"),
  SQUARE_LINK_PRIME_SPONSOR:     optionalEnv("SQUARE_LINK_PRIME_SPONSOR"),
  SQUARE_LINK_CHAMPION_PARTNER:  optionalEnv("SQUARE_LINK_CHAMPION_PARTNER"),
};