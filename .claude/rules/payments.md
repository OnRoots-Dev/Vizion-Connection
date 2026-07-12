---
description: 決済（Square）関連の規則
paths:
  - "app/api/business-checkout/**"
  - "app/api/webhooks/**"
  - "features/business/**"
  - "lib/supabase/business-orders.ts"
---

# 決済（Square）規則

## 構成
- `app/api/business-checkout/route.ts` — チェックアウト開始（Square Payment Link）
- `app/api/webhooks/square/route.ts` — Square webhook 受信
- `features/business/server/create-checkout.ts` / `save-order.ts` — 注文作成・保存
- `lib/supabase/business-orders.ts` — `business_orders` テーブル操作（email + amount = PII/取引情報）
- 環境変数: `SQUARE_LINK_*`（プランごとの支払いリンク）, `SQUARE_WEBHOOK_SIGNATURE_KEY`

## 鉄則
1. **webhook は署名検証が最優先**。`SQUARE_WEBHOOK_SIGNATURE_KEY` による検証より前にペイロードを信用する処理を書かない。検証失敗は 4xx で即return。
2. **webhookペイロードの生ログ禁止**（買い手のemail・金額・カード情報片が含まれ得る）。ログは event type と注文IDのみ。
3. 金額・プランは**サーバー側の定義**（`features/business/constants.ts`）を正とする。クライアントから渡された金額を信用しない。
4. 注文状態遷移は冪等に書く（Squareのwebhookは同一イベントが複数回届き得る）。`findLatestIncompleteOrderByEmail` 等の既存経路を使う。
5. `business_orders` への DELETE/UPDATE は sql-guard が人間確認を強制する（PIIテーブル指定）。
6. 返金・注文取り消し等の**お金が動く操作は実装前に必ず人間に確認**。
