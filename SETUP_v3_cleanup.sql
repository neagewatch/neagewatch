-- ============================================
-- v3 既存データのクリーンアップ
-- 「change_date が一律で同じ日付になっている誤データ」を NULL に戻す
-- Supabase SQL Editor で実行してください
-- ============================================

-- 1) RSS自動収集分（手動でない & 未検証）で、change_date と article_date が
--    同じ＝「実施日が抽出できず公開日で埋められた」データの change_date を NULL に。
update public.price_changes
set change_date = null
where is_verified is not true
  and source_url <> 'manual'
  and change_date is not null
  and change_date = article_date;

-- 2) 特定の誤った固定日（例: 全件 2026-06-21 になっている場合）を一括 NULL 化したいとき：
-- update public.price_changes
-- set change_date = null
-- where change_date = '2026-06-21' and is_verified is not true;

-- 実行後、bot.py / seed_history.py を再実行すると正しい日付で再収集されます。
