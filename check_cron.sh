#!/bin/bash
# ============================================
# Bot cron稼働確認スクリプト
# 使い方: bash check_cron.sh
# ============================================

echo "===== 1. crontab登録状況 ====="
crontab -l 2>/dev/null | grep -i "bot.py" || echo "⚠️  crontabにbot.pyの登録が見つかりません"

echo ""
echo "===== 2. bot.log 最終更新時刻 ====="
if [ -f bot.log ]; then
  echo "最終更新: $(stat -f '%Sm' bot.log 2>/dev/null || stat -c '%y' bot.log 2>/dev/null)"
  echo "--- 直近20行 ---"
  tail -20 bot.log
else
  echo "⚠️  bot.log が存在しません"
fi

echo ""
echo "===== 3. 手動テスト実行 ====="
echo "以下で手動実行できます:"
echo "  cd $(pwd) && python3 bot.py"
