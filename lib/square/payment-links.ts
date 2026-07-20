// lib/square/payment-links.ts
// Square Checkout API — Create Payment Link (quick_pay)

import { randomUUID } from "crypto";

export type CreatePaymentLinkInput = {
  /** 表示名（例: "Roots - 東京都"） */
  name: string;
  /** 金額（JPY の最小単位 = 円） */
  amountYen: number;
  /** 決済完了後のリダイレクト先 */
  redirectUrl: string;
  /** Payment.note に載せるメモ（webhook 照合用。PII は載せない） */
  paymentNote?: string;
  /** 重複防止キー（省略時は UUID を発行） */
  idempotencyKey?: string;
};

export type CreatePaymentLinkResult =
  | {
      success: true;
      url: string;
      paymentLinkId: string;
      orderId: string | null;
      idempotencyKey: string;
    }
  | { success: false; error: string; status?: number };

function getSquareConfig(): {
  accessToken: string;
  locationId: string;
  baseUrl: string;
} | null {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN?.trim() ?? "";
  const locationId = process.env.SQUARE_LOCATION_ID?.trim() ?? "";
  if (!accessToken || !locationId) return null;

  const env = (process.env.SQUARE_ENVIRONMENT ?? "sandbox").toLowerCase();
  const baseUrl =
    env === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  return { accessToken, locationId, baseUrl };
}

/**
 * Square POST /v2/online-checkout/payment-links
 * quick_pay 形式でホスト型チェックアウト URL を生成する。
 */
export async function createSquarePaymentLink(
  input: CreatePaymentLinkInput,
): Promise<CreatePaymentLinkResult> {
  const config = getSquareConfig();
  if (!config) {
    return {
      success: false,
      error: "Square の認証情報が未設定です（SQUARE_ACCESS_TOKEN / SQUARE_LOCATION_ID）",
      status: 500,
    };
  }

  if (!Number.isFinite(input.amountYen) || input.amountYen <= 0) {
    return { success: false, error: "金額が不正です", status: 400 };
  }

  const idempotencyKey = input.idempotencyKey?.trim() || randomUUID();

  const body = {
    idempotency_key: idempotencyKey,
    quick_pay: {
      name: input.name,
      price_money: {
        amount: Math.round(input.amountYen),
        currency: "JPY",
      },
      location_id: config.locationId,
    },
    checkout_options: {
      redirect_url: input.redirectUrl,
      ask_for_shipping_address: false,
    },
    ...(input.paymentNote
      ? { payment_note: input.paymentNote.slice(0, 500) }
      : {}),
  };

  let res: Response;
  try {
    res = await fetch(`${config.baseUrl}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-12-18",
      },
      body: JSON.stringify(body),
    });
  } catch {
    console.error("[createSquarePaymentLink] network error");
    return { success: false, error: "Square API への接続に失敗しました", status: 502 };
  }

  const json = (await res.json().catch(() => ({}))) as {
    payment_link?: { id?: string; url?: string; order_id?: string };
    errors?: Array<{ code?: string; detail?: string }>;
  };

  if (!res.ok || !json.payment_link?.url) {
    const code = json.errors?.[0]?.code ?? res.status;
    console.error("[createSquarePaymentLink] api error", code);
    return {
      success: false,
      error: "支払いリンクの作成に失敗しました",
      status: res.status >= 400 && res.status < 600 ? res.status : 502,
    };
  }

  return {
    success: true,
    url: json.payment_link.url,
    paymentLinkId: json.payment_link.id ?? "",
    orderId: json.payment_link.order_id ?? null,
    idempotencyKey,
  };
}

export function isSquareConfigured(): boolean {
  return getSquareConfig() !== null;
}
