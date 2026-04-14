# Phase 1 Audit - 2026-04-09

## Immediate Performance Findings

- `app/(app)/dashboard/DashboardClient.tsx`
  初回表示時に `career/me` を先読みしていた。プロフィール/キャリア表示時だけ取得する方が初速に有利。

- `app/(app)/dashboard/components/ProfileCard.tsx`
  マウント時に毎回 QR コード生成が走っていた。カード裏面を開くまで遅延できる。

- `app/(app)/dashboard/components/ProfileCard.tsx`
  起動演出のために全表示箇所でタイマーが走っていた。常時必要ではないので、必要時だけ有効化すべき。

- `app/(app)/dashboard/views/HomeView.tsx`
  ホーム表示時に `collect/list` と `discovery` を追加取得している。今後は表示優先度に応じた遅延化の余地あり。

- `app/news/NewsRoomsPageClient.tsx`
  一覧画像がすべて通常 `img`。記事数が増えるほど描画コストが増えやすい。

## Unused / Cleanup Candidates

以下は現時点の参照検索上、未使用候補です。削除前に最終確認推奨。

- `components/CountdownBanner.tsx`
  参照なし。

- `components/marketing/CountdownTimer.tsx`
  参照なし。日付も過去設定のまま。

- `components/marketing/sections/FAQSectionLight.tsx`
  参照なし。旧バリエーションの可能性が高い。

## Structure Observations

- `ProfileCardSection` が「背景演出」「カード本体」「シェアUI」「モーダル」まで抱えており責務が重い。
- 公開プロフィール `app/u/[slug]/page.tsx` でもダッシュボード用カードをそのまま再利用しているため、表示責務の分離が必要。
- `News Rooms` はすでに一覧型に近いが、`Top Stories` と `Feed` の情報密度・画像比率がまだ揺れている。

## Recommended Next Refactors

1. `ProfileCardSection` を以下へ分割
   - `ProfileCardShell`
   - `ProfileCardFace`
   - `ProfileCardShareMenu`
   - `CheerCommentsModal`

2. 公開プロフィールを単一ページ内切替へ整理
   - `Profile`
   - `Career`
   - `Ranking`

3. `News Rooms` を横長リストへ統一
   - 画像左固定
   - 見出し2行
   - 補助情報を1行帯で集約
