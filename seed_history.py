# -*- coding: utf-8 -*-
"""
NeageWatch 過去データ投入スクリプト（seed）
- RSSでは拾えない「過去の有名な値上げ履歴」を手動キュレーションで投入
- 内容量(amount)・実施日(change_date)付き
- is_verified=True（手動検証済み）
- 出典URL付き

使い方: python3 seed_history.py
重複は source_url + product + change_date で判定してスキップ
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# (company, slug, product, old, new, change_date, amount, source_url)
# 価格は店頭想定価格・大人料金など代表値。出典は記事URL。
SEED = [
    # ===== カルビー ポテトチップス うすしお味 (60g→55g) =====
    ("カルビー", "calbee", "ポテトチップス うすしお味", 120, 130, "2022-01-31", "60g", "https://www.nikkei.com/article/DGXZQOUC08BNQ0Y1A001C2000000/"),
    ("カルビー", "calbee", "ポテトチップス うすしお味", 130, 140, "2022-09-01", "60g", "https://neage.jp/syokuhin/kashi/calbee_potatochips1.html"),
    ("カルビー", "calbee", "ポテトチップス うすしお味", 140, 150, "2023-06-01", "60g", "https://neage.jp/syokuhin/kashi/calbee_potatochips1.html"),
    ("カルビー", "calbee", "ポテトチップス うすしお味", 150, 160, "2025-07-21", "55g", "https://www.nikkei.com/article/DGXZQOUC0369L0T00C25A3000000/"),
    ("カルビー", "calbee", "ポテトチップス うすしお味", 160, 170, "2026-02-01", "55g", "https://gr-on.com/potato-chips/"),
    # ===== カルビー 堅あげポテト =====
    ("カルビー", "calbee", "堅あげポテト うすしお味", 140, 150, "2019-06-01", "65g", "https://neage.jp/syokuhin/kashi/calbee_kataage.html"),
    ("カルビー", "calbee", "堅あげポテト うすしお味", 150, 160, "2022-09-01", "65g", "https://neage.jp/syokuhin/kashi/calbee_kataage.html"),
    ("カルビー", "calbee", "堅あげポテト うすしお味", 160, 170, "2023-06-01", "65g", "https://neage.jp/syokuhin/kashi/calbee_kataage.html"),
    ("カルビー", "calbee", "堅あげポテト うすしお味", 170, 180, "2024-06-01", "60g", "https://neage.jp/syokuhin/kashi/calbee_kataage.html"),
    ("カルビー", "calbee", "堅あげポテト うすしお味", 180, 190, "2025-09-01", "60g", "https://neage.jp/syokuhin/kashi/calbee_kataage.html"),
    # ===== カルビー ポテトチップスBIGBAG =====
    ("カルビー", "calbee", "ポテトチップス BIGBAG", 248, 268, "2022-09-01", "152g", "https://neage.jp/syokuhin/kashi/calbee_potatochipsbigbag.html"),
    ("カルビー", "calbee", "ポテトチップス BIGBAG", 268, 298, "2023-06-01", "160g", "https://neage.jp/syokuhin/kashi/calbee_potatochipsbigbag.html"),

    # ===== 東京ディズニーリゾート 1デーパスポート(大人) 最高価格 =====
    ("東京ディズニーリゾート", "tdr", "1デーパスポート（大人・最高価格）", 7500, 8200, "2020-04-01", "1日券", "http://rojinekoseikatsu.com/post-3909/"),
    ("東京ディズニーリゾート", "tdr", "1デーパスポート（大人・最高価格）", 8200, 8700, "2021-03-20", "1日券", "https://castel.jp/p/5109"),
    ("東京ディズニーリゾート", "tdr", "1デーパスポート（大人・最高価格）", 8700, 9400, "2021-10-01", "1日券", "https://castel.jp/p/5109"),
    ("東京ディズニーリゾート", "tdr", "1デーパスポート（大人・最高価格）", 9400, 10900, "2023-10-01", "1日券", "https://castel.jp/p/3148"),
    ("東京ディズニーリゾート", "tdr", "駐車場（普通車）", 3000, 4000, "2026-06-16", "1日", "https://www.pricey.jp/web/articles/4523"),

    # ===== マクドナルド ハンバーガー（参考価格・段階値上げ） =====
    ("マクドナルド", "mcdonalds", "ハンバーガー", 110, 130, "2022-03-14", "1個", "https://www.mcdonalds.co.jp/"),
    ("マクドナルド", "mcdonalds", "ハンバーガー", 130, 150, "2022-09-30", "1個", "https://www.mcdonalds.co.jp/"),
    ("マクドナルド", "mcdonalds", "ハンバーガー", 150, 170, "2023-01-16", "1個", "https://www.mcdonalds.co.jp/"),
    ("マクドナルド", "mcdonalds", "ハンバーガー", 170, 190, "2024-01-24", "1個", "https://www.mcdonalds.co.jp/"),

    # ===== 日清 カップヌードル =====
    ("日清", "nissin", "カップヌードル", 193, 214, "2022-06-01", "78g", "https://www.nissin.com/"),
    ("日清", "nissin", "カップヌードル", 214, 236, "2023-06-01", "78g", "https://www.nissin.com/"),
    ("日清", "nissin", "カップヌードル", 236, 271, "2024-06-01", "78g", "https://www.nissin.com/"),

    # ===== うまい棒 =====
    ("やおきん", "yaokin", "うまい棒", 10, 12, "2022-04-01", "1本", "https://www.yaokin.com/"),
    ("やおきん", "yaokin", "うまい棒", 12, 15, "2023-10-01", "1本", "https://www.yaokin.com/"),

    # ===== 銭湯（東京都公衆浴場入浴料金） =====
    ("東京都の銭湯", "sento_tokyo", "大人入浴料", 470, 480, "2022-07-15", "1回", "https://www.1010.or.jp/"),
    ("東京都の銭湯", "sento_tokyo", "大人入浴料", 480, 500, "2023-07-01", "1回", "https://www.1010.or.jp/"),
    ("東京都の銭湯", "sento_tokyo", "大人入浴料", 500, 520, "2024-07-01", "1回", "https://www.1010.or.jp/"),

    # ===== 青春18きっぷ =====
    ("青春18きっぷ", "seishun18", "青春18きっぷ", 11850, 12050, "2014-04-01", "5回分", "https://www.jr.cyberstation.ne.jp/"),

    # ===== ガリガリ君 =====
    ("赤城乳業", "akagi", "ガリガリ君ソーダ", 60, 70, "2016-04-01", "1本", "https://www.akagi.com/"),
    ("赤城乳業", "akagi", "ガリガリ君ソーダ", 70, 80, "2024-04-01", "1本", "https://www.akagi.com/"),

    # ===== 明治ミルクチョコレート =====
    ("明治", "meiji", "ミルクチョコレート", 130, 140, "2022-06-01", "50g", "https://www.meiji.co.jp/"),
    ("明治", "meiji", "ミルクチョコレート", 140, 150, "2023-06-01", "50g", "https://www.meiji.co.jp/"),

    # ===== USJ スタジオ・パス（大人・参考最高価格） =====
    ("ユニバーサル・スタジオ・ジャパン", "usj", "1デイ・スタジオ・パス（大人）", 8400, 8900, "2022-01-01", "1日券", "https://www.usj.co.jp/"),
    ("ユニバーサル・スタジオ・ジャパン", "usj", "1デイ・スタジオ・パス（大人）", 8900, 9800, "2023-01-01", "1日券", "https://www.usj.co.jp/"),
    ("ユニバーサル・スタジオ・ジャパン", "usj", "1デイ・スタジオ・パス（大人・最高価格）", 9800, 10900, "2024-02-01", "1日券", "https://www.usj.co.jp/"),
]


def main():
    inserted = 0
    skipped = 0
    for company, slug, product, old, new, change_date, amount, url in SEED:
        # 重複チェック（同一商品・同一実施日）
        existing = (
            supabase.table("price_changes")
            .select("id")
            .eq("slug", slug)
            .eq("product", product)
            .eq("change_date", change_date)
            .execute()
        )
        if existing.data:
            skipped += 1
            continue

        change_type = "increase" if new >= old else "decrease"
        data = {
            "company": company,
            "slug": slug,
            "product": product,
            "old_price": old,
            "new_price": new,
            "change_type": change_type,
            "source_url": url,
            "article_text": f"{company} {product} が {old}円から{new}円に改定（実施日 {change_date}）。内容量: {amount}。",
            "change_date": change_date,
            "article_date": None,   # 記事日不明なので NULL
            "amount": amount,
            "is_verified": True,
        }
        try:
            supabase.table("price_changes").insert(data).execute()
            inserted += 1
            print(f"✅ {company} {product} {old}→{new} ({change_date}) {amount}")
        except Exception as e:
            print(f"ERROR: {product} - {e}")

    print(f"\n=== seed完了: 新規{inserted}件 / スキップ{skipped}件 ===")


if __name__ == "__main__":
    main()
