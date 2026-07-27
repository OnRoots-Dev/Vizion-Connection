# Vizion Connection Design System — MASTER

全画面（公開プロフィール / ポートフォリオ / ダッシュボード / マーケティングLP）の Source of Truth。
実装上の単一ソースは **`lib/design/tokens.ts`**（TS）と **`app/globals.css` の `--vc-*`**（CSS）。両者は常に同値を保つ。

## 世界観

- 主軸: **スポーティ・ダイナミック × ゲーミフィケーション**
- 味付け: **ミニマル・高級感 × サイバー・フューチャー**
- ダーク基調・大胆な余白。ネオン `#C8E800` が主役、役割色はサブ識別（ロールタグ・バッジ・カード等）に限定。

## カラーパレット

| トークン | 値 | 用途 |
|---|---|---|
| `bg` / `--vc-bg-base` | `#09090f` | ページ背景 |
| `surface` / `--vc-bg-surface` | `#111118` | カード・パネル |
| `elevated` / `--vc-bg-elevated` | `#1a1a24` | 重なり面（モーダル・アバター台座） |
| `border` | `rgba(255,255,255,0.08)` | 標準ボーダー |
| `borderStrong` | `rgba(255,255,255,0.16)` | アクティブ・ホバー |
| `text` | `#f0f0f5` | 本文主要テキスト |
| `textSecondary` | `rgba(255,255,255,0.62)` | サブテキスト（≈7.5:1） |
| `textTertiary` | `rgba(255,255,255,0.55)` | **読ませる最小コントラスト**（≈6:1、AA準拠） |
| `decorative` | `rgba(255,255,255,0.38)` | **装飾専用。テキストに使用禁止**（AA未達） |
| `accent` | `#C8E800` | 主役ネオン（対 bg ≈14:1） |
| `accentSoft` | `#DDF24E` | ネオン上の強調テキスト |
| `accentDim` / `accentBorder` / `accentFaint` | alpha 0.14 / 0.38 / 0.07 | ネオンの面・枠・淡面 |
| `gold` | `#FFD600` | Cheer 専用色 |
| `green` | `#10B981` | 成功・アクティブ |
| `danger` | `#FF5050` | エラー・破壊的操作 |
| 役割色 | Athlete `#FF5050` / Trainer `#30de1d` / Crew `#FFC81E` / Business `#3C8CFF` / Admin `#7C3AED` | ロール識別のみ |

**ルール**: 生hexをコンポーネントに直書きしない。必ず `lib/design/tokens.ts`（TSX）か `--vc-*`（CSS）を参照。
ネオンのグローは `GLOW.soft / strong / text` の3段階のみ。

## タイポグラフィ

| ロール | フォント | サイズ |
|---|---|---|
| Display XL | Bebas (`FONT.display`) | `clamp(64px, 11vw, 118px)` — ヒーローネーム |
| Display L | Bebas | 52px — 主役数値（Cheer / DAY） |
| Display M | Bebas | 36px — 副数値 |
| Heading | Noto 900 | 22px |
| Body | Noto (`FONT.body`) | 14px / 13px、line-height 1.7–1.85 |
| Label | Space Mono (`FONT.mono`) | 11 / 10 / 9px、大文字＋letter-spacing 0.12–0.28em |

数値は `fontVariantNumeric: tabular-nums` を必ず指定（カウントアップ時のレイアウトシフト防止）。

## 余白・角丸

- **4pxグリッド**: `SPACE` = 4 / 8 / 12 / 16 / 24 / 32 / 48 のみ使用（18px等は禁止）
- セクション間 32px、パネル内 16px、要素間 8–12px
- 角丸 `RADIUS` / `INTERACTION.radius`（同値）:
  - 8（小要素）
  - **12** ボタン・チップ・**入力**（`--vc-radius` / `md`）
  - **16** **カード**・パネル（`lg`）
  - **28** auth ガラスカード・大型モーダルシェル（`xl` / `glass`）
  - 999 ピル

## 共通インタラクションレシピ（`INTERACTION`）

**今後すべてのボタン・カード実装が参照する単一基準。**  
正本: `lib/design/tokens.ts` の `INTERACTION`（および `SPRING_*`）。  
実装の入口: `components/ui/Pressable.tsx`（押下）、`lib/motion/apple-springs.ts`（spring の re-export）。

### 1. 押下フィードバック

| 項目 | 値 | コード |
|---|---|---|
| scale | **0.97** | `INTERACTION.press.scale` / `PRESS_SCALE` |
| spring | `type: "spring"`, **stiffness 600**, **damping 32**, **mass 0.5** | `INTERACTION.press.transition` / `SPRING_PRESS` / `MOTION.press` |

```ts
whileTap={{ scale: INTERACTION.press.scale }}
transition={INTERACTION.press.transition}
// または <Pressable> / PRESS_SCALE
```

**統一メモ**: 旧 `TAP_SCALE = 0.96` と `MOTION.press.damping: 30`（mass なし）は廃止し、Pressable 実値（0.97 / damping 32 / mass 0.5）に揃えた。

### 2. ホバー時のリフトアップ

| 項目 | 値 | コード |
|---|---|---|
| Y 移動 | **-2px**（上） | `INTERACTION.hover.y` |
| scale 上限 | **1.02** | `INTERACTION.hover.scale` |
| box-shadow 静止 | `0 4px 16px rgba(0,0,0,0.28)` | `INTERACTION.hover.shadow.rest` |
| box-shadow ホバー | `0 12px 32px rgba(0,0,0,0.42)` | `INTERACTION.hover.shadow.hover` |

```ts
whileHover={{ y: INTERACTION.hover.y, scale: INTERACTION.hover.scale }}
// style / animate で shadow.rest ↔ shadow.hover を切替
```

### 3. 角丸スケール

| 用途 | px | トークン |
|---|---|---|
| ボタン | 12 | `INTERACTION.radius.button` / `RADIUS.md` |
| 入力欄 | 12 | `INTERACTION.radius.input` / `RADIUS.md` |
| カード | 16 | `INTERACTION.radius.card` / `RADIUS.lg` |
| ガラス / 大型シェル | 28 | `INTERACTION.radius.glass` / `RADIUS.xl` |

Tailwind 対応の目安: 12 → `rounded-xl`、16 → `rounded-2xl`、28 → `rounded-[28px]`。

### 4. 半透明素材（glass）

| 用途 | 値 | コード |
|---|---|---|
| 標準ガラス blur | **24px** | `INTERACTION.glass.blurPx` |
| saturate | **160%** | `INTERACTION.glass.saturatePct` |
| モーダルスクラム blur | **12px** | `INTERACTION.glass.scrimBlurPx` |
| 強フロスト（ログイン等・例外） | **40px** | `INTERACTION.glass.blurHeavyPx` |

```css
backdrop-filter: blur(24px) saturate(160%);
/* モーダル背後: blur(12px) */
```

`prefers-reduced-transparency` 時は blur を外し不透明サーフェスへ。

**実装ヘルパー**（`lib/design/tokens.ts`）:
- `cardSurfaceTokens()` — 不透明カード（SectionCard / 公開プロフィール `vpPanel`）
- `authGlassTokens({ heavy?, reducedTransparency? })` — auth ガラス（register / reset / thanks）
- CSS: `.vc-login-glass`（login・heavy blur）/ `.vc-auth-glass`（標準 blur）— 変数 `--vc-radius-glass` / `--vc-glass-blur*` / `--vc-shadow-*` は上記と同値

### 5. トランジション（duration / easing / spring）

| 用途 | Motion（正） | CSS fallback |
|---|---|---|
| ボタン押下 | `INTERACTION.transition.press` = SPRING_PRESS | `100ms` + `cubic-bezier(0.22, 1, 0.36, 1)` |
| カード出現 | `INTERACTION.transition.cardEnter` = SPRING_CARD_ENTER（stiffness 520 / damping 40 / mass 0.7） | `280ms` + 同 easing |
| 画面遷移 | `INTERACTION.transition.page` = SPRING_PAGE（stiffness 380 / damping 34 / mass 0.9） | `320ms` + 同 easing |
| reduced-motion | `INTERACTION.transition.reduced`（tween 0.2s easeOut） | — |

`lib/motion/apple-springs.ts`: `springPress` / `springSnap`(= cardEnter) / `springDefault`(= page) / `fadeReduced` は上記の re-export。

### モーション 3 リズム（`MOTION`）

| トークン | spring | 用途 |
|---|---|---|
| `MOTION.press` | = SPRING_PRESS | 押下応答 |
| `MOTION.pop` | stiffness 300 / damping 14 | 入場・報酬（軽いオーバーシュート） |
| `MOTION.slide` | stiffness 260 / damping 24 | 開閉・レイアウト遷移 |

- 入場 stagger は 40–60ms/項目
- 報酬演出（Cheer送信・Bond成立・達成バッジ）のみ強めのフィードバック（パーティクル・リング衝撃波・シャイン）を許可
- **全アニメーションは `useReducedMotion` / `prefers-reduced-motion` でフォールバック必須**

## アイコン辞書（`lib/design/icons.tsx`）

**同じ機能には必ず同じアイコン。絵文字・テキストグリフ（★ ⊹ 🔥）をアイコンに使わない。**

| 機能 | アイコン | 形式 |
|---|---|---|
| Cheer | `IconCheer` | 塗り星（色は原則 gold） |
| Streak（継続） | `IconStreak` | 炎・線画 |
| Journey（記録） | `IconJourney` | レイヤー・線画 |
| Bond | `IconBond` | ⊹形4点スパーク・塗り（ブランドグリフのSVG化） |
| 最長記録 | `IconTrophy` | トロフィー・線画 |
| 達成 | `IconCheck` | チェック（色に頼らない達成識別に必須） |
| 開閉 | `IconChevronDown` | Expandable 用 |

線画は stroke 2px / viewBox 24 で統一。既知の残課題: ダッシュボードのコンディション絵文字（`TimelineView` の 😵😕🙂🔥🚀）は別途置換予定。

## アクセシビリティ

- テキストコントラスト AA（4.5:1）以上。`decorative` トークンをテキストに使わない
- タップ領域 44×44px 以上（`MIN_TAP`）
- 色だけで情報を伝えない（達成=チェックアイコン、コンディション=数値併記）
- 開閉UIは `aria-expanded` / `aria-controls`、アイコンボタンは `aria-label` 必須
- `:focus-visible` にネオンリング（outline 2px `--vc-accent`）

## 情報設計（公開プロフィール）

「1画面1メッセージ」。常時表示 = ①アイデンティティ（Hero）②熱量（HeatPanel）③積み重ね（Timeline 3件）。
Milestones詳細 / Network詳細 / Career / Schedule / Card / Share は段階的開示（`Expandable`）。
同じ数値を複数箇所に表示しない（Bond数=Network、Cheer数=HeatPanel が正）。
