# UI Rebuild Issue Log

運用: 画面改修中に発見した問題をここへ記録する（その場で場当たり修正しない）。
分類: A11y / Copy / Duplication / DeadCTA / Responsive / Animation / TokenViolation / APIMismatch
状態: `[ ]` open / `[x]` resolved（解決PRを併記）

## Legacy（Phase 1/2以前からの既知事項）

- [ ] [Duplication] accent hex直書き 236件（#C8E800/rgba(200,232,0)）→ 画面移行時にtokenへ置換
- [ ] [Duplication] views内 inline style 1,091件 → 移行画面から段階削減
- [ ] [Duplication] 'Space Mono' 幽霊指定 23件 → JetBrains Mono置換（3-Bで新規コードは禁止、既存は移行時）
- [ ] [A11y] dashboard系 focus-visible不在 → 新primitiveは標準装備、旧は移植時に付与
- [ ] [A11y] シートのEsc/フォーカストラップ不在（GestureSheet以外）
- [ ] [Responsive] `text-[Npx]` 454件 → TYPEスケールへ収斂
- [ ] [Animation] reduced-motion未対応アニメ多数（views 2/32のみ対応）→ 移植時に100%化
- [ ] [Copy] 「プロフイール」誤字(CheerView)
- [ ] [DeadCTA] CheckoutView(SPA孤児view) → 3-Kで正規pageへ統一
- [ ] [TokenViolation] LPスコープ --role-athlete:#d91414 → 3-Bでブランド値へ統一（済みになったら[x]）
- [ ] [Duplication] formatDate/formatYen等10重複 → lib/format集約（未着手）
- [ ] [Duplication] Header/Footer 3系統ずつ → LP刷新時統合

## Phase 3 以降の追加分

（各フェーズの実装中に追記）
