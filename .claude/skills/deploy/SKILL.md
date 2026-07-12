---
name: deploy
description: 本番デプロイ手順（Vercel）。デプロイ、リリース、本番反映の際に使用。
---

# デプロイ手順（Vercel）

本番は Vercel。`main` ブランチへの push で自動デプロイされる。**push = デプロイ**である自覚を持つこと。

## 手順

1. **デプロイ前チェック（全て通ってから push）**:
   ```bash
   npm run lint
   npx tsc --noEmit
   npm run build
   ```
2. **スキーマ依存の確認**: デプロイするコードが新しいDBスキーマを前提にする場合、**マイグレーションを先に適用**（`.claude/skills/db-migration/SKILL.md`）。逆順にするとデプロイ直後に本番エラーが出る。
3. **環境変数の確認**: 新しい環境変数を使うコードなら、Vercel側に設定済みかをユーザーに確認してから push。
4. **push**: コミット・push はユーザーの指示があるときのみ。force push は protect hook が確認を求める。
5. **デプロイ後確認**: 主要ルート（`/`, `/dashboard`, `/timeline`, `/pulse`）の応答と、変更した機能の実動作。

## ロールバック

- コード: Vercel ダッシュボードの Instant Rollback（前デプロイに戻す）をユーザーに案内。
- DB: マイグレーションのロールバックSQLを用意していた場合のみ。RLS関連は `SECURITY.md` 末尾のロールバックSQL参照。

## 禁止

- ビルド未確認での push
- DBマイグレーションとコードデプロイの順序無視
- `.env*` / シークレットに触れる操作（hooks がブロックする）
