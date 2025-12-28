# Muscle Tracker - Webアプリ版

トレーニング中のUX最適化を重視した高機能筋トレ記録Webアプリです。

## 特徴

### トレーニング中のUX最適化

- **大きなボタン**: 手が震えている状態でも操作しやすい巨大なボタンデザイン
- **自動インターバルタイマー**: セット記録後、自動的に90秒のインターバルタイマーが起動
- **ビープ音通知**: タイマー終了時に音で通知
- **ダークモード**: トレーニング中の目の負担を軽減

### スマート入力

- **前回セットのコピー**: ワンタップで前回の重量・回数を入力
- **+/-ボタン**: 重量は2.5kg刻み、回数は1回刻みで調整可能
- **種目の自動部位判定**: 種目を選ぶだけで自動的に部位が記録される

### Notion連携

- **自動データ送信**: トレーニング終了時に自動的にNotionへ送信
- **2つのデータベース**: セット記録とセッション情報を分けて管理
- **詳細なログ**: 日時、種目、部位、重量、回数を記録
- **セッション管理**: 開始時刻、終了時刻、総時間を記録

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- React Context + useReducer
- Notion API

## 使い方

1. **トレーニング開始**: ホーム画面の「トレーニング開始」ボタンをクリック
2. **セット記録**: 種目を選択し、重量と回数を入力して「セット記録」をクリック
3. **インターバル**: 自動的に90秒のタイマーが開始（スキップ可能）
4. **トレーニング終了**: 右上の「終了」ボタンでNotionに自動送信

## Notion連携設定

環境変数（`.env.local`）:
```
NEXT_PUBLIC_NOTION_API_KEY=your_notion_api_key
NEXT_PUBLIC_NOTION_LOGS_DB_ID=your_logs_database_id
NEXT_PUBLIC_NOTION_SESSIONS_DB_ID=your_sessions_database_id
```

詳細は[NOTION_SETUP.md](./NOTION_SETUP.md)を参照。

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリをVercelにインポート
2. 環境変数を設定:
   - `NEXT_PUBLIC_NOTION_API_KEY`
   - `NEXT_PUBLIC_NOTION_LOGS_DB_ID`
   - `NEXT_PUBLIC_NOTION_SESSIONS_DB_ID`
3. デプロイ

## ライセンス

MIT
