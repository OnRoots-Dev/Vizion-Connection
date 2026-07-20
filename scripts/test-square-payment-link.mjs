/**
 * Square Sandbox: Payment Link 生成のスモークテスト
 *
 * 使い方:
 *   node --env-file=.env.local scripts/test-square-payment-link.mjs
 *
 * 必要 env:
 *   SQUARE_ACCESS_TOKEN
 *   SQUARE_LOCATION_ID
 *   SQUARE_ENVIRONMENT=sandbox  (default)
 */
import { randomUUID } from "crypto";

const token = process.env.SQUARE_ACCESS_TOKEN?.trim();
const locationId = process.env.SQUARE_LOCATION_ID?.trim();
const env = (process.env.SQUARE_ENVIRONMENT ?? "sandbox").toLowerCase();
const base =
  env === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";

if (!token || !locationId) {
  console.error("Missing SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID in env");
  process.exit(1);
}

const body = {
  idempotency_key: randomUUID(),
  quick_pay: {
    name: "地域プラン - 東京都 (sandbox test)",
    price_money: { amount: 30000, currency: "JPY" },
    location_id: locationId,
  },
  checkout_options: {
    redirect_url: "https://app.vizion-connection.jp/business/complete",
    ask_for_shipping_address: false,
  },
  payment_note: "vc:roots:東京都:sandbox_test",
};

const res = await fetch(`${base}/v2/online-checkout/payment-links`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Square-Version": "2024-12-18",
  },
  body: JSON.stringify(body),
});

const json = await res.json();
if (!res.ok) {
  console.error("FAILED", res.status, JSON.stringify(json, null, 2));
  process.exit(1);
}

console.log("OK payment_link.url =", json.payment_link?.url);
console.log("id =", json.payment_link?.id);
console.log("Open the URL in a browser and pay with Sandbox test card 4111 1111 1111 1111");
