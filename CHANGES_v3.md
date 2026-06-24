# NeageWatch v3 変更まとめ

## 必須: デプロイ前にSupabaseで実行するSQL（順番通り）
1. `SETUP_v3_migration.sql` … amount/report_count/is_verified カラム追加、reports テーブル作成、日付をNULL許容に
2. `SETUP_v3_cleanup.sql` … 誤って今日の日付で埋まった change_date を NULL に戻す
（`SETUP_bot_runs.sql` を未実行なら先に実行）

## データ投入
```bash
python3 seed_history.py   # 過去の有名値上げ（ポテチ/ディズニー/USJ等）を一括投入
python3 bot.py            # 最新RSS収集（RSSを16→26ソースに拡大）
```

## 主な変更点

### 値上げ日の固定問題を根本解決
- bot.py: 実施日が抽出できなければ change_date を **NULL** に（今日で埋めない）
- 記事公開日も取れなければ NULL
- フロント全ページ: 日付は情報がある時だけ表示
- 管理画面: 日付は空欄でOK（空欄＝表示しない）

### 過去データ・需要データを投入
- seed_history.py に実在の値上げ履歴を手動キュレーション
  - カルビー ポテトチップス/堅あげポテト/BIGBAG（2019〜2026の段階値上げ）
  - 東京ディズニーリゾート 1デーパスポート（2020〜2023）+ 駐車場
  - USJ スタジオ・パス、マック、カップヌードル、うまい棒、銭湯、明治チョコ等
- すべて出典URL・内容量・実施日付き、is_verified=True

### 内容量(amount)対応
- DB列追加、bot.pyが記事から自動抽出（60g/350ml/12本入など）
- 詳細・一覧・企業ページ・管理画面で表示

### 毎日見たくなる仕組み
- ダッシュボードに「本日実施／直近7日／今後7日」サマリー
- 値上げカレンダー（/calendar）で今後の予定を先取り

### 共有したくなる仕組み
- 「😱 衝撃の値上げ率ランキング」TOP3カラフルカード
- 詳細ページのSNSシェア（X/LINE/Web Share API）

### 問い合わせ（誤り報告）ボタン
- 詳細ページに設置。価格/日付/内容量/その他を選んで報告
- reports テーブルに保存 → 管理画面に「🚩 ユーザーからの誤り報告」一覧
- 管理画面で「対応済み」にできる

## デプロイ
```bash
cd /Users/mm/neagewatch
tar xzf ~/Downloads/neagewatch-v3.tar
git add -A && git commit -m "v3: 過去データ投入/内容量/日付NULL化/エンゲージメント/誤り報告" && git push origin main
# bot.py と seed_history.py がbot側ディレクトリなら、そちらにもコピー
```
