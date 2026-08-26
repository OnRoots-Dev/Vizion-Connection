# PHASE 3 Screen Architecture — 全画面構築ルール

目的: 「毎画面の詳細設計をしなくても、Vizion ConnectionらしいUIを一貫実装できるルール」の確定。
基準: docs/ui-rebuild/phase3-a-ia-migration.md + Design System v2 primitives。

---

## 1. MVP全画面一覧（分類: Page / Sheet / Modal / Handler）

| # | 画面 | 分類 | Route/View | 目的 | Primary CTA | Secondary CTA | Template | 主要Component | Loop位置 | 次画面 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Home | Page | ?view=home | 今日の行動提示 | Activityを記録 | 近くのActivity/Moments全て | Dashboard | HomeHero/SectionCard/ActivityCard小 | ハブ | 2,3,4 |
| 2 | Activities | Page | ?view=activities | 活動の記録・管理 | ＋Activity作成 | 詳細Sheet/Moment公開 | ListFeed | ActivityCard/FilterChips/DetailSheet | ①起点 | Place→Moment/Map |
| 3 | Moments | Page | ?view=moments | 公開物閲覧・反応 | （文脈: 反応=Cheer） | Comment/Connection/Profile | ListFeed(+Tabs) | MomentCard/EngagementRow | ③④ | Profile/User |
| 4 | Viz Map | Page(Overlay) | ?view=viz_map | 空間発見 | Marker選択→DetailSheet | Filter/現在地/戻る | FullScreenMap | MapCanvas/MapDetailSheet/FilterSheet | ⑤発見 | ActivitySheet/Profile/Home |
| 5 | Schedule | Page | /schedule | 予定管理 | 予定作成(canEdit) | 戻る | Calendar | FullCalendar/MiniCalendar | 補完 | Home/Activity |
| 6 | Profile | Page | ?view=profile | 自分のID管理 | プロフィール編集 | Card/公開を見る/⚙Settings | Detail(Identity) | ProfileIdentityHeader/Avatar/Badge | Identity | career/card/settings/公開p |
| 7 | Portfolio | Page | ?view=portfolio | 積み重ねの証明 | 公開ページ確認・共有 | Homeへ | Detail(List混在) | DAY数値/Gauge/JourneyCard | Identity深層 | 公開Portfolio/Home |
| 8 | Card | Page | ?view=card | 共有資産 | 共有/リンクコピー | プロフィールへ | Detail(Card) | VizionIdCard/ShareRow | Identity資産 | 外部/u/[slug] |
| 9 | Settings | Page | ?view=settings | アカウント操作 | （行ごとの操作） | ⚠退会=danger | Menu/Form | Row/Button/ConfirmDialog | Account | contact/削除Modal/login |
| 10 | Contact | Page | ?view=contact | 問い合わせ | 送信 | — | Form | Field/Input/Toast | Support | 完了状態→dashboard |
| 11 | Career編集 | Page | ?view=career | ID詳細編集 | 保存 | キャンセル | Form(Wizard) | WizardUI→Field移行 | Identity編集 | profile |
| 12 | Login | Page | /login | 入場 | ログインする | 登録/再送 | Form(Glass) | vc-auth系→Field移行 | Entry | onboarding/checkout(redirect) |
| 13 | Register | Page | /register | 入会 | 次へ→登録 | role選択/戻る | Form(Wizard) | StepBar/Field | Entry | thanks |
| 14 | Thanks | Page | /thanks?type | 状態通知 | 続ける(文脈別) | — | Status | AuthIconBadge | Entry処理 | onboarding/checkout(next)/login |
| 15 | ResetPW | Page | /reset-password | 再設定 | メール送信/変更 | loginへ | Form(Glass) | Field | Account復旧 | login |
| 16 | Onboarding Welcome | Page | /onboarding | 導入 | Pulseをはじめる | 後にする | Ritual | Lottie/大タイポ | Activation | profile |
| 17 | OB Profile | Page | /onboarding/profile | 基本情報 | 登録して始める | 後にする | Form | Field/CropModal | Activation | day0 |
| 18 | OB DAY0 | Page | /onboarding/day0 | 原点宣言 | DAY0を刻む | 後にする | Ritual | ProfileCard/Lottie | Activation | invite |
| 19 | OB Invite | Page | /onboarding/invite | 招待・完了 | Dashboardへ進む | X共有/コピー | Status(Ritual) | referralUrl生成 | Activation完了 | dashboard/checkout(Business) |
| 20 | Business LP | Page | /business | プラン理解 | 申し込む(modal) | 比較表/FAQ/残枠 | Marketing | PlanCards/JapanMap | 収益入口 | register/login→checkout |
| 21 | Checkout | Page | /dashboard/business/checkout | 契約確定 | 決済へ→Square | プラン比較/contact(legacy) | Form(Commerce) | PlanSelect/ad_slots在庫 | 収益 | complete |
| 22 | Complete | Page | /business/complete | 決済結果 | 初期設定へ/ダッシュボード | — | Status | — | 収益完了 | onboarding/dashboard |
| 23 | LP | Page | / | 理解→参加 | マップに参加 | Business/login/各section | Marketing | Hero/Sections/Footer | 外部入口 | register/business |
| 24 | 公開Profile | External | /u/[slug] | 人物理解 | Cheer | Offer(/r)/Portfolio/register(ref) | ExternalDetail | ProfileIdentityHeader/HeatPanel | 発見の出口 | portfolio/r/register |
| 25 | 公開Portfolio | External | /u/[slug]/portfolio | 軌跡共有 | 共有 | register(ref) | ExternalList | TimelineStack/CountUp | 証明 | share/register |
| 26 | ShareCard | External | /card/[slug] | 拡散用カード | コピー/シェア | profile/register | ExternalCard | VizionIdCard | 拡散 | u/[slug] |
| 27 | Referral | Handler | /r/[slug] | 計測redirect | — | — | — | Upstash incr | 成長 | register?ref= |
| 28 | NotFound | Page | * | 復帰 | Homeへ | — | Status | — | — | / |
| 29 | ErrorBoundary | Page | error.tsx(新設3-M) | 異常復帰 | 再読込/Home | — | Status | — | — | / |

### Sheets（GestureSheet。全て同一文脈の一時詳細＝Page化しない）

| Sheet | 親 | 内容/操作 |
|---|---|---|
| ActivityDetailSheet | ActivitiesView | 詳細/完了/中止/**Moment公開**/削除(Confirm) |
| MapActivitySheet | VizMap | Type/時間/場所/主催者 → **View Activity**(=ActivitiesView該当詳細へ) |
| CommentsSheet | MomentCard | 一覧/投稿/削除 |
| FilterSheet | VizMap | Type絞り込み |
| ProfilePreviewSheet | CheerView等 | ユーザー概要→Profile |
| ShareSheet | Card/Portfolio | X/LINE/コピー |

### Modals（遮断・確認）

DeleteAccountConfirm / Activity削除Confirm / Businessプラン選択(LP) / AvatarCrop / ProfileHeroCrop / Day0Welcome

---

## 2. Page Template 最終候補（9種）

| Template | 適用画面 | 新規? | 理由 |
|---|---|---|---|
| **ListFeedTemplate** | Activities/Moments | 改題(既存パターン標準化) | PageHeader+FilterChips+CardList+States+FAB の反復最上位 |
| **IdentityDetailTemplate** | Profile/Portfolio/Card/Settings | 新設 | 「Identityヘッダー+セクション群」構造の共通化。Menu型(Settings)もこれに包含 |
| **FormTemplate** | Register/OB/Contact/Checkout/Career | 既存方針確定 | Sectioned fields + sticky footer |
| **FullScreenMapTemplate** | VizMap | 確定済 | floating chrome + snap sheets |
| **DashboardTemplate** | Home のみ | 新設 | 「今日やること」集約はList/Detail双方に不適合。1画面専用設計を許容 |
| **RitualTemplate** | OB welcome/DAY0 | 新設 | 情報密度を極限まで下げた単焦点レイアウト。activation体験の核 |
| **StatusPageTemplate** | Thanks/Complete/NotFound/Error | 新設 | icon+見出し+説明+CTA1つの完了/異常共通形 |
| **MarketingTemplate** | LP/BusinessLP | 新設 | scroll narrative + sticky nav + CTA block |
| **CalendarTemplate** | Schedule | ラップ | FullCalendar既存をToken適用でラップ（全面再設計はしない） |

---

## 3. Component 3層分類

### Tier A — Shared Primitive（components/ui / 汎用・無ドメイン語彙）

既存v2: Button / Input / Textarea / Select / Field / Chip / Badge / Avatar / Tabs / GestureSheet / AlertDialog / Toast / EmptyState / ErrorState / Skeleton*
✛ **3-C以降で追加**: `IconButton`(size sm/md + aria-label必須) / `SearchInput`(Field+🔍+clear) / `SurfaceCard`(SectionCardのtoken版) / `Divider` / `Spinner`

### Tier B — Vizion Feature Component（ドメイン語彙・Primitive合成）

| Component | 使用画面 | 中身 |
|---|---|---|
| **AppHeader** | 全Page | back/title/sub/actions(right slots) |
| **BottomNav / Sidebar** | Shell | nav-config駆動 |
| **ActivityCard** | Activities/Home/Map後続 | TypeBadge+title+PlaceLine+DateTimeLine+status |
| **MomentCard** | Moments/Home | UserRow+media+text+tags+EngagementRow |
| **EngagementRow** | MomentCard内 | CheerButton+comments+ConnectionButton |
| **CheerButton** | MomentCard/公開Profile | 既存logic・shell token化 |
| **ConnectionButton** | 同上 | 既存state機械維持 |
| **PlaceLine** | ActivityCard/Sheet/Detail | 📍廃止→icon: 名称+都道府県(+precision注記) |
| **DateTimeLine** | 同上 | tabular-nums表示規約 |
| **UserRow** | Cheer候補/ランキング/申請 | Avatar+name+Badge+action slot |
| **ProfileIdentityHeader** | 自分Profile/公開Profile | Avatar xl/name/RoleBadge/sport/Primary(slot) |
| **VizionIdCard** | Card/Day0/Home | ProfileCardSectionのtokenリファクタ |
| **FilterBar** | ListFeed/Map | Chip行+sheet trigger |
| **MapMarkerLayer / MapDetailSheet** | MapCanvas内部 | marker glyph+選択ring/snap sheet |
| **AdCard** | feed挿入 | 2実装統合(3-H時に判断) |
| **ShareRow** | Card/Portfolio/公開 | copy/X/LINE |

### Tier C — Page固有（viewファイル内に留める）

HomeHero挨拶 / Day0宣言compose / Checkout価格テーブル / 公開ProfileのHeatPanel・TimelineStack(独自視覚) / CalendarToolbar配線

---

## 4. 情報配置ルール（AI実装時の判定基準）

```
共通の縦のリズム（Page共通）
[Context Header: 何の場面か + 戻る]
→ [Page Title: 目的語]
→ [Primary Zone: 主対象+Primary CTA]
→ [Filter/補助制御]
→ [Content本体]
→ [Supporting info: meta/注記 — text-muted, 小]
→ [Bottom action: Form以外では置かない(Navと重複するため)]
→ [Global Nav]
```

| 問い | 判定ルール |
|---|---|
| 何を上に置くか | 「ユーザーが今どこにいるか(AppHeader)」→「何ができるか(Primary)」。ロゴ回遊は外部ページのみ |
| 何を大きく見せるか | Primary Zoneの対象（次に取れる行動の“材料”）。数字はDisplay font+tabular-nums |
| 何をSheetにするか | 同一文脈の一時詳細（戻ってくる前提）。**URLで共有したいものはPage化** |
| 何をPageにするか | 共有URLを持つ/検索流入があり得る/封印境界を跨ぐもの |
| Primary CTAの位置 | mobile=コンテンツ直後 or 下部固定帯(Form)；desktop=右上 or 末尾右。FABは「生成」(Activity作成)のみに許可 |
| Supporting info | すべてmeta行(text-muted 11px mono)に正規化。emoji禁止→lucide icon |
| 密度 | 1画面1主題。カード間16px/セクション32px/ページ余白mobile 12px desktop 32px |

---

## 5. CTA Hierarchy（全画面共通）

| レベル | 見た目 | 数 | 位置 | 例 |
|---|---|---|---|---|
| **Primary** | accent bg + black text + glow(控えめ) | **1/画面** | 上記配置ルール | 「Activityを記録」「送信」「DAY0を刻む」「決済へ」 |
| Secondary | surface-2 + border + ink text | ≤2 | Primary隣/下 | 「プレビュー」「あとで」以外の代替経路 |
| Tertiary/Ghost | text-only(muted or accent underline無し) | 複数可 | header右/一覧末尾 | 「すべて見る」「キャンセル」 |
| Destructive | danger outline | 1 | **最下段・他と隔離** | 退会/削除 → **必ずConfirmDialog経由** |

規約: label=動詞+対象（「保存する」○「OK」×）。loading中はspinner+「〜中...」へラベル交代。Ghost連鎖で迷子化させない（Ghostの先にPrimaryがあること）。

---

## 6. State Matrix（実装必須範囲）

| 対象 | Default | Loading | Empty | Error | Disabled | Success | Hover | Focus | Press | ReducedMotion |
|---|---|---|---|---|---|---|---|---|---|---|
| Button/IconButton | ◯ | spinner+label | − | − | ◯ opacity .4 | Toast連携 | y:-2+shadow-hover | **ring必須** | scale.97 | press→fade |
| Chip/Tabs | ◯ | − | − | − | ◯ | selected=accent | border-strong | **ring必須** | .96 | fade |
| Card類 | ◯ | **Skeleton置換** | 親がEmptyState | 親がErrorState | − | − | y:-2 | − | − | entrance fade |
| Sheet | snap定義 | Skeleton可 | 自動close | inline error | reduce時drag off | − | − | **trap+Esc** | drag | fade only |
| Field | ◯ | async hint | − | invalid枠+msg | ◯ | − | border-strong | **ring必須** | − | fade |
| Toast | ◯ | − | − | tone色分け | − | auto 4s | − | − | tap dismiss | fade |
| Page(List) | fetch | Skeleton統一(人工delay禁止) | EmptyState(**action付き**) | ErrorState(**retry付き**) | − | − | − | − | − | stagger→即時表示 |
| Map | tiles | Loading pill | 空域文言 | banner+retry | − | − | marker cursor | − | 選択pulse | pulse→静止色 |

原則: Success状態の画面内バナーは禁止（Toastへ統一）。例外=遷移先がStatusPageの場合のみ。

---

## 7. 人間が決めるべき項目（AI判断との境界）

### AIが判断してよいこと
spacing/sizeのスケール適用、token内での色運用、micro-copy調整（**事実・数値・固有名詞は変えない**）、spring/duration値、responsiveの細部、primitive内部実装、statesの見た目

### 人間（オーナー）決定事項 — 推奨案付き

| # | 項目 | 推奨（既定値として採用） |
|---|---|---|
| H1 | **LPファーストビューの訴求軸** | 「地図が世界観の顔」= Map-firstヒーロー（活動が可視化される地図を主役） |
| H2 | Business LPの金色トーン(#F4C10A) | Brand limeへ完全統一（役割色Business青は識別に限定） |
| H3 | OnboardingへのLoop説明 | DAY0前の**静的図解1枚**のみ（インタラクティブデモは作らない） |
| H4 | 公開ProfileのHeatPanel/TimelineStack | 視覚構図は維持しtoken適用のみ（全面再設計はしない） |
| H5 | Settingsの項目順 | アカウント情報 → 可視性 → メール → パスワード → Contact → 退会(隔離) |
| H6 | 破壊的操作copyの強度 | 「〜します。よろしいですか？」+取り消せない旨1行（過剰な脅し文禁止） |
| H7 | Moments feed内の広告位置 | 5件ごと1枚・末尾固定枠なし（既存頻度より控えめ） |
| H8 | mobile Profileタブ内menu順 | Schedule / Portfolio / Card / 公開ページを見る / Settings |

**運用**: 上記既定値で3-C〜Lを実装し、オーナーは完成形を見て個別差し戻し可能。差し戻しはIssue Log経由で対応。
