// lib/airtable/client.ts

// lib/airtable/client.ts

import Airtable from "airtable";
import { env } from "@/lib/env";

Airtable.configure({ apiKey: env.AIRTABLE_API_KEY });

export const airtableBase = Airtable.base(env.AIRTABLE_BASE_ID);

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN?.trim();
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID?.trim();

export const BASE_URL = AIRTABLE_BASE_ID
  ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`
  : '';

// ─── テーブル名 ────────────────────────────────────────────────────────────────
export const TABLE = {
  USERS: (process.env.AIRTABLE_USERS_TABLE ?? 'Users').trim(),
  CHEERS: (process.env.AIRTABLE_CHEERS_TABLE ?? 'Cheers').trim(),
  BUSINESS_ORDERS: (process.env.AIRTABLE_BUSINESS_ORDERS_TABLE ?? 'BusinessOrders').trim(),
  VERIFY_TOKENS: (process.env.AIRTABLE_VERIFY_TOKENS_TABLE ?? 'VerifyTokens').trim(),
} as const;

// ─── 汎用リクエスト ────────────────────────────────────────────────────────────
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!AIRTABLE_TOKEN || !BASE_URL) {
    throw new Error(
      'Airtable env vars are not configured (AIRTABLE_TOKEN / AIRTABLE_BASE_ID).'
    );
  }

  const res = await fetch(`${BASE_URL}/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('Airtable error:', res.status, text);
    throw Object.assign(
      new Error('Airtable request failed'),
      { status: res.status, body: text }
    );
  }

  return res.json() as Promise<T>;
}

// ─── ユーティリティ ────────────────────────────────────────────────────────────
/** テーブル名をエンコードした文字列を返す */
export const encTable = (name: string) => encodeURIComponent(name);

/** filterByFormula 用のクエリ文字列を生成する */
export const filterQuery = (formula: string) =>
  `filterByFormula=${encodeURIComponent(formula)}`;
