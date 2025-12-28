# Notion連携セットアップガイド

このアプリは、トレーニング記録をNotionに自動送信する機能を備えています。以下の手順に従って設定してください。

## 1. Notion Integration（統合）の作成

1. [Notion Developers](https://www.notion.so/my-integrations) にアクセス
2. 「新しい統合を作成」をクリック
3. 統合名を入力（例: "Muscle Tracker"）
4. ワークスペースを選択
5. 「送信」をクリック
6. **Internal Integration Token（シークレット）** をコピーして保存

## 2. Notionデータベースの作成

### (A) Logs Database（セット記録用）

1. Notionで新しいデータベースを作成
2. データベース名: `Workout Logs`（任意）
3. 以下のプロパティを追加:

| プロパティ名 | タイプ | 説明 |
|------------|--------|------|
| Date | Date | 記録日時 |
| Menu | Select | 種目名 |
| BodyPart | Select | 部位 |
| Weight | Number | 重量（kg） |
| Reps | Number | 回数 |

4. データベースIDをコピー:
   - データベースページを開く
   - URLの `https://www.notion.so/` の後の32文字（ハイフンを除く）がデータベースID
   - 例: `https://www.notion.so/abc123def456...` → `abc123def456...`

### (B) Sessions Database（セッション情報用）

1. Notionで新しいデータベースを作成
2. データベース名: `Workout Sessions`（任意）
3. 以下のプロパティを追加:

| プロパティ名 | タイプ | 説明 |
|------------|--------|------|
| Date | Title | セッション日 |
| StartTime | Date | 開始時刻 |
| EndTime | Date | 終了時刻 |
| DurationMin | Number | 総時間（分） |

4. データベースIDをコピー（上記と同じ方法）

## 3. データベースに統合を接続

**重要**: 作成した2つのデータベースに、統合へのアクセス権を付与する必要があります。

1. 各データベースページを開く
2. 右上の「…」メニューをクリック
3. 「接続」→「統合」を選択
4. 作成した統合（例: "Muscle Tracker"）を選択

## 4. 環境変数の設定

アプリに以下の環境変数を設定します:

```bash
EXPO_PUBLIC_NOTION_API_KEY=your_integration_token_here
EXPO_PUBLIC_NOTION_LOGS_DB_ID=your_logs_database_id_here
EXPO_PUBLIC_NOTION_SESSIONS_DB_ID=your_sessions_database_id_here
```

### 設定方法

#### ローカル開発の場合

1. プロジェクトルートに `.env` ファイルを作成
2. 上記の環境変数を記入
3. 開発サーバーを再起動

#### Manus環境の場合

1. 管理UIの「Settings」→「Secrets」パネルを開く
2. 以下の3つのシークレットを追加:
   - `EXPO_PUBLIC_NOTION_API_KEY`
   - `EXPO_PUBLIC_NOTION_LOGS_DB_ID`
   - `EXPO_PUBLIC_NOTION_SESSIONS_DB_ID`

## 5. 動作確認

1. アプリで「トレーニング開始」をタップ
2. いくつかのセットを記録
3. 「終了」ボタンをタップ
4. Notionのデータベースを確認:
   - `Workout Logs` に各セットの記録が追加されているか
   - `Workout Sessions` にセッション情報が追加されているか

## トラブルシューティング

### データが送信されない

- 環境変数が正しく設定されているか確認
- Integration Tokenが正しいか確認
- データベースIDが正しいか確認（ハイフンを除く32文字）
- データベースに統合へのアクセス権が付与されているか確認

### エラーメッセージが表示される

- ブラウザの開発者コンソールでエラー内容を確認
- Notionのプロパティ名が正しいか確認（大文字小文字も一致する必要があります）
- Notionのプロパティタイプが正しいか確認

### Selectプロパティのオプションが自動作成されない

- Notion APIは新しいSelectオプションを自動作成します
- 初回送信時にオプションが作成されるため、2回目以降は正常に動作します

## 参考リンク

- [Notion API Documentation](https://developers.notion.com/)
- [Notion Database Properties](https://developers.notion.com/reference/property-object)
- [Notion Integration Guide](https://www.notion.so/help/add-and-manage-integrations-with-the-api)
