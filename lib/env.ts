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
  AIRTABLE_API_KEY: requireEnv("AIRTABLE_API_KEY"),
  AIRTABLE_BASE_ID: requireEnv("AIRTABLE_BASE_ID"),
  RESEND_API_KEY: requireEnv("RESEND_API_KEY"),
  NEXT_PUBLIC_BASE_URL:
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  FROM_EMAIL: process.env.FROM_EMAIL ?? "noreply@vizion-connection.jp",
  SESSION_SECRET: requireEnv("SESSION_SECRET"),
  SQUARE_LINK_ENTRY_SUPPORTER: optionalEnv("SQUARE_LINK_ENTRY_SUPPORTER"),
  SQUARE_LINK_STARTER_POSITION: optionalEnv("SQUARE_LINK_STARTER_POSITION"),
  SQUARE_LINK_IMPACT_PARTNER: optionalEnv("SQUARE_LINK_IMPACT_PARTNER"),
  SQUARE_LINK_PRIME_SPONSOR: optionalEnv("SQUARE_LINK_PRIME_SPONSOR"),
  SQUARE_LINK_CHAMPION_PARTNER: optionalEnv("SQUARE_LINK_CHAMPION_PARTNER"),
};