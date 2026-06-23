# Bot稼働セットアップ手順

## 1. Supabaseに監視テーブルを作成
`SETUP_bot_runs.sql` の内容を Supabase の SQL Editor で実行。
これでダッシュボードにBot稼働状況（最終実行・追加件数・実行履歴バー）が表示されます。

## 2. cronが本当に動いているか確認
```bash
cd /Users/mm/neagewatch   # またはbotのあるディレクトリ
bash check_cron.sh
```

## 3. cronが未登録なら登録（1時間ごと）
```bash
crontab -e
```
以下を追記（パスは環境に合わせて調整）:
```
0 * * * * cd /Users/mm/pricewatch-bot && /usr/bin/python3 bot.py >> bot.log 2>&1
```

※ Macはスリープ中cronが動きません。確実に動かすなら:
- Macを常時起動にする、または
- GitHub Actions / Vercel Cron など常時稼働環境への移行を検討

## 4. 動作確認（手動実行）
```bash
python3 bot.py
```
成功すると `bot_runs` に1行記録され、ダッシュボードの
「収集Bot 正常稼働中」インジケーターが緑になります。

## 値上げ日（change_date）について
今回の改修で、bot.pyが記事本文から「○月○日から」「○年○月より」などの
実施日を自動抽出して change_date に保存するようになりました。
過去データで日付が揃ってしまっているものは、管理画面から個別修正できます。
