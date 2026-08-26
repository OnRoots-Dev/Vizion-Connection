# PHASE 3-A 成果物 — IA移行マップ / 機能保全マトリクス / Navigation検証 / 改修境界 / Before-After

Status: Approved (A1/A2/A3/A6/A7/A8 承認済み, A4/A5 は本文書で確定)
Date: 2026-08-26
前提: DB・API契約・RLS・認証・Square・封印状態は不変。**入口の再設計のみ行い、機能は削除しない。**

---

## 1. Current → New Screen Migration Map

実コード（app/配下全Route + DashboardView 31ID + nav-config）を突合して確定。

| 現在 | 新UIでの配置 | Route維持 | 備考 |
|---|---|---|---|
| `/dashboard?view=home` | **Home**（Core Loopハブに再設計） | ✅ | 3-F |
| `?view=activities` | **Activity**（一覧+作成Hub） | ✅ | 3-G |
| `?view=moments` | **Moments**（Feed + Tabs切替） | ✅ | 3-H |
| `?view=cheer` | **Moments内「Cheer」セグメント**へ統合 | ✅ deep link時セグメント自動切替 | 受信箱としての機能完全維持 |
| `?view=viz_map` | **FullScreen Map**オーバーレイ（portal描画） | ✅ | 3-L |
| `?view=schedule` / `/schedule` | **`/schedule` を正規化**（Home card・Profile menu・Sidebarから進入） | ✅ 両方存続 | SPA埋め込みcaseはdeep link互換で残置 |
| `?view=profile` | **Profile**タブ（mobile）/ Sidebar PRESENCE（desktop）、ヘッダー歯車→Settings | ✅ | 3-I |
| `?view=card` | **Profile内セグメント**＋共有フローから | ✅ deep link維持 | |
| `?view=career` (`edit`) | **Profile編集入口**から到達 | ✅ deep link維持 | |
| `?view=settings` | **Profile歯車** ＋ Sidebar ACCOUNT | ✅ | Nav itemから外すが機能維持 |
| `?view=contact` | Settings内部（現状）＋checkout legacy link先 | ✅ | |
| `?view=portfolio` | Sidebar PRESENCE ＋ Profile menu | ✅ | 公開版 `/u/[slug]/portfolio` と対 |
| `/dashboard/business/checkout(/complete)`, `/business/complete` | Route現状維持・UI刷新 | ✅ | 3-K |
| `/u/[slug]`(+/portfolio,/card) `/p/[username]` `/card/[slug]` `/r/[slug]` | Route現状維持・視覚刷新 | ✅ | 3-I |
| `/login` `/register` `/reset-password` `/thanks` `/auth/confirm` | Route維持・刷新 | ✅ | 3-D |
| `/onboarding`(welcome/profile/day0/invite) | Step構成維持・刷新 | ✅ | 3-E |
| `/`, `/business` | LP刷新 | ✅ | 3-C / 3-K |
| 封印: トップレベル13パス / dashboard view 17種 / API prefix 7 | **封印維持**（表示・導線なし） | — | mvp-scope.ts 正 |

---

## 2. Feature Preservation Matrix

DB テーブル名は `lib/supabase/*`, `features/*/server/*` の `.from()` 実装から実査。

| 機能 | 現画面 | 現Route | 新配置 | 入口 | 出口 | API | DB | Core Loop位置 |
|---|---|---|---|---|---|---|---|---|
| **Activity** | ActivitiesView | ?view=activities | Activity Hub（Nav第2） | BottomNav/Sidebar/Home CTA | 詳細Sheet→Moment公開/Map | `/api/activities(+/[id])` | activities, places, users | ①起点 |
| **Place** | PlacePicker(Activity作成内) | 同上 | 同（住所検索付き） | Activity作成Flow | Viz Mapピン | `/api/places` GET/POST | places | ② |
| **Moment** | MomentsFeedView + Activity詳細からの公開 | ?view=moments | Moments Feed（canonical公開物） | Nav第4/Home最新 | Cheer/Comment/Connection/Profile | `/api/moments*` | moments, moment_comments, cheers, activities, connections | ③ |
| **Cheer** | CheerView(受信)+Card内送信 | ?view=cheer | Moments「Cheer」segment | Moments tab badge/Home | Profile/送信候補→Profile | `/api/cheer/{suggest,received}`, `/api/moments/[id]/cheer` | cheers, users | ④反応 |
| **Comment** | CommentsSheet(MomentCard) | 同上 | Moment Card内維持 | Moment Card | Connection/Profile | `/api/moments/[id]/comments*` | moment_comments | ④反応 |
| **Connection** | ConnectionButton | 同上 | Moment Card/Profile維持 | Moment/Profile | 相互Profile | `/api/connections(+/[id])` | connections | ④接続 |
| **Viz Map** | VizMapView(fullscreen portal) | ?view=viz_map | Nav中央 | Nav中央/Home近く | 詳細Sheet→Activity/Profile | `/api/viz-map` | activities, places, users | ⑤発見→① |
| **Schedule** | ScheduleClient(embedded + full page) | `/schedule` + ?view=schedule | 正規化: `/schedule` | Home次予定/Profile menu/Sidebar | Activity Detail連携 | `/api/schedules*` | schedules | 補完(Activity時間軸) |
| **Profile/Vizion ID** | DashboardProfileView / u/[slug] | ?view=profile / `/u/[slug]` | Profile tab + 公開刷新 | Nav第5/Map/Moments | Portfolio/Card/Cheer/Connection | `/api/profile/*` | users | Identity層 |
| **Portfolio** | PortfolioView(RLS直接読取) + 公開版 | ?view=portfolio / `/u/[slug]/portfolio` | Sidebar PRESENCE/Profile menu | Profile menu/公開profile | 公開共有 | `/api/portfolio/[slug]*` + journeys RLS SELECT | journeys, users | 証明層 |
| **Card** | CardView + `/card/[slug]` | ?view=card / `/card/[slug]` | Profile内segment + share | Profile/共有URL | 外部共有/register?ref | `/api/share-image`系 | users | 共有資産 |
| **Cheer送信候補** | CheerView suggest | 同上 | Cheer segment内 | 同上 | Profile | `/api/cheer/suggest` | users, cheers, journeys(24h) | ④ |
| **Onboarding** | (onboarding) 3step | /onboarding/* | 構成維持・全面刷新 | register後 | Dashboard/Business checkout | `/api/onboarding/*`, `/api/profile/save` | users | Activation |
| **Business決済** | LP + checkout + complete | /business, /dashboard/business/checkout, /business/complete | UI刷新（経路既存） | Sidebar Upgrade/LP/Login redirect | Square↔complete | `/api/business-checkout*`, webhooks/square | business_orders, users.sponsor_plan, ad_slots | 収益(Loop外) |

---

## 3. Navigation Validation（A4/A5 確定）

### 最終BottomNav（mobile）

```
Home   Activity   ⟨Viz Map⟩   Moments   Profile
```

Settings項目→Profile歯車へ。Schedule項目→除外（下記）。Cheer→Moments segment。

### 最終Sidebar（desktop）

```
CORE     Home / Activities / Moments / Viz Map / Schedule
PRESENCE Profile / Portfolio / Card
ACCOUNT  Settings / Contact
```

### UX根拠

1. **5項目制限**: 作業記憶の限界(4±1)と親指リーチ帯。Instagram/Strava等の一般化パターンに整合し初見で迷わない。現行6項目のSettingsは利用頻度低かつ「アカウント操作」でありIdentity(Profile)の一部として自然。
2. **中央=Viz Map**: 中央スロットは最大の注意値。「地図がプロダクトの顔」という世界観の表明であり、ループ収束点への常時アクセスを保証する（Stravaの中央+=記録に対する、Vizionの中央=可視化）。Full Screen化(3-L)との組合せで「押したら世界が広がる」体験。
3. **Activity左隣**: 生成動詞の位置。Strava(+)/Instagram(+)と同型で学習コストゼロ。Core Loop起点をワンタップに。
4. **ScheduleをNavから外す理由**: (a) 頻度——消費は「今日の予定確認」であり実際のジョブはHomeが果たす（Nav項目は頻度ではなく**destination性**で選ぶべき）；(b) 情報重複——Home「次の予定」カードが同一ジョブをより文脈付きで提供；(c) 圧縮——5項目に圧縮しCore Loop(Home/Activity/Moments/Map)を優先。**代替入口3本で保護**: Home card / Profile menu / Desktop CORE。habit対策としてdeep link `?view=schedule` も維持。
5. **Cheer→Moments内segment**: 心理モデルの一致——「送る」も「受け取る」も**他人の活動への反応**であり、反応の文脈はフィード。分離していた旧CheerViewは導線孤立の実害が出ていた（監査D5: 「もっと見る→discovery」死にCTA）。統合で単一エンゲージメント面となりbadgeで受信可視性も担保。`?view=cheer` deep linkはsegment自動切替に変換（機能削除なし）。
6. **Profile⊃{Portfolio, Card}**: 三者は同一人物の表現の深度差——Profile(現在)/Portfolio(積み重ね)/Card(共有切札)。並列タブより**同一Identity内の深度**として理解される。Top-level圧縮と情報の意味的分類を両立。いずれもSidebar/mobile menuから独立アクセス可能。

---

## 4. UI Rebuild Boundary

### 変更してよい（UI）

- レイアウト/余白/タイポ/カラー/Radius/Shadow/Glass
- Component構成とそのAPI（新primitive導入・旧統合）
- Navigation外観と項目配置（**Route/deep linkは保存**）
- アニメーション/トランジション（reduced-motion準拠）
- Empty/Loading/Error表現、CTA配置・ラベル（事実は変えない）
- 情報の見せ方・画面構成・IA再グループ化

### 変更禁止（機能）

- DB schema / RLS / データ意味論（Moment≠Timeline等）
- API契約（新規が必要なら**実装前に報告**）
- 認証・認可・CSRF・Rate Limit・セキュリティガード
- Square backend / webhook / 決済state機械
- MVP scope（封印の維持）/ Core Loopの意味
- visibility / ownership ルール
- 既存正常なサーバー処理
- **機能の削除禁止** —— Schedule/Cheer/Card等はNavから外れても機能・Route・APIは温存し入口のみ再設計する

---

## 5. Before / After Architecture

```
【Before — 機能棚の羅列】
Dashboard SPA 31 views（Active 13 + Sealed 17 + 孤児1）
 ├ Pulse/Journey/Circuit等 封印依存の死ゾーン
 ├ Cheer が孤立View（導線断）
 ├ Schedule が view と route の二重存在
 ├ Settings/Contact/Checkout の入口バラけ
 └ Nav二重定義（Sidebar手書き vs nav-config）

【After — Core Loop中心の4層】
CAPTURE   Home(今日する事) → Activity → Place → Moment
ENGAGE    Moments Feed ⇄ Cheer(segment) / Comment / Connection
DISCOVER  Viz Map(FullScreen, 中央固定) → 詳細Sheet → 次のActivity
IDENTITY  Profile ⊃ {Portfolio, Card} + Schedule(時間軸補完)
ACCOUNT   Settings / Contact / Business Upgrade
※ すべての主要面が CAPTURE↔ENGAGE↔DISCOVER の輪に接続。
   Sealed機能は構造上どこにも現れない。
```
