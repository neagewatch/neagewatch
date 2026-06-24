# -*- coding: utf-8 -*-
"""
NeageWatch 価格変動収集Bot
- 複数RSSから値上げ/値下げ記事を収集
- 記事本文から「実施日（change_date）」を抽出
- RSSの公開日を article_date として保存
- 実行ログを bot_runs テーブルに記録（稼働監視用）
"""

import os
import re
import sys
import datetime
import requests

from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client

# =====================
# ENV
# =====================
load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
)

JST = datetime.timezone(datetime.timedelta(hours=9))
NOW = datetime.datetime.now(JST)

# =====================
# 企業マスタ（フロントの companies.ts と同期）
# =====================
COMPANY_MASTER = {
    # 外食
    "マクドナルド": ("マクドナルド", "mcdonalds"), "マック": ("マクドナルド", "mcdonalds"), "マクド": ("マクドナルド", "mcdonalds"),
    "吉野家": ("吉野家", "yoshinoya"), "すき家": ("すき家", "sukiya"), "松屋": ("松屋", "matsuya"),
    "モスバーガー": ("モスバーガー", "mos"), "モス": ("モスバーガー", "mos"),
    "ケンタッキー": ("ケンタッキー", "kfc"), "KFC": ("ケンタッキー", "kfc"), "ケンタ": ("ケンタッキー", "kfc"),
    "サイゼリヤ": ("サイゼリヤ", "saizeriya"), "サイゼ": ("サイゼリヤ", "saizeriya"),
    "スターバックス": ("スターバックス", "starbucks"), "スタバ": ("スターバックス", "starbucks"),
    "ガスト": ("ガスト", "gusto"), "大戸屋": ("大戸屋", "ootoya"),
    "ココイチ": ("CoCo壱番屋", "cocoichi"), "CoCo壱": ("CoCo壱番屋", "cocoichi"), "ココ壱": ("CoCo壱番屋", "cocoichi"),
    "てんや": ("天丼てんや", "tenya"), "リンガーハット": ("リンガーハット", "ringerhut"),
    "餃子の王将": ("餃子の王将", "ohsho"), "王将": ("餃子の王将", "ohsho"), "大阪王将": ("大阪王将", "osaka_ohsho"),
    "日高屋": ("日高屋", "hidakaya"), "やよい軒": ("やよい軒", "yayoiken"),
    "一蘭": ("一蘭", "ichiran"), "一風堂": ("一風堂", "ippudo"),
    "丸亀製麺": ("丸亀製麺", "marugame"), "丸亀": ("丸亀製麺", "marugame"),
    "コメダ珈琲": ("コメダ珈琲店", "komeda"), "コメダ": ("コメダ珈琲店", "komeda"),
    "ドトール": ("ドトール", "doutor"), "タリーズ": ("タリーズコーヒー", "tullys"),
    "フレッシュネスバーガー": ("フレッシュネスバーガー", "freshness"), "ロッテリア": ("ロッテリア", "lotteria"),
    "びっくりドンキー": ("びっくりドンキー", "bikkuridonkey"),
    # 寿司
    "スシロー": ("スシロー", "sushiro"), "くら寿司": ("くら寿司", "kurazushi"),
    "はま寿司": ("はま寿司", "hamazushi"), "かっぱ寿司": ("かっぱ寿司", "kappazushi"),
    "がってん寿司": ("がってん寿司", "gatten"), "魚べい": ("魚べい", "uobei"),
    # コンビニ
    "セブンイレブン": ("セブンイレブン", "seven"), "セブン-イレブン": ("セブンイレブン", "seven"), "セブン": ("セブンイレブン", "seven"),
    "ファミリーマート": ("ファミリーマート", "familymart"), "ファミマ": ("ファミリーマート", "familymart"),
    "ローソン": ("ローソン", "lawson"), "ミニストップ": ("ミニストップ", "ministop"),
    # 小売
    "イオン": ("イオン", "aeon"), "西友": ("西友", "seiyu"),
    "ドン・キホーテ": ("ドン・キホーテ", "donki"), "ドンキ": ("ドン・キホーテ", "donki"),
    "コストコ": ("コストコ", "costco"), "ユニクロ": ("ユニクロ", "uniqlo"),
    "無印良品": ("無印良品", "muji"), "無印": ("無印良品", "muji"),
    "ジーユー": ("GU", "gu"), "ニトリ": ("ニトリ", "nitori"),
    "ダイソー": ("ダイソー", "daiso"), "セリア": ("セリア", "seria"), "イケア": ("IKEA", "ikea"),
    "ヨドバシ": ("ヨドバシカメラ", "yodobashi"), "ビックカメラ": ("ビックカメラ", "biccamera"),
    # 食品メーカー
    "日清": ("日清", "nissin"), "カップヌードル": ("日清", "nissin"),
    "明治": ("明治", "meiji"), "カルビー": ("カルビー", "calbee"),
    "グリコ": ("江崎グリコ", "glico"), "江崎グリコ": ("江崎グリコ", "glico"),
    "森永": ("森永", "morinaga"), "ハウス食品": ("ハウス食品", "house"),
    "キッコーマン": ("キッコーマン", "kikkoman"), "味の素": ("味の素", "ajinomoto"),
    "ロッテ": ("ロッテ", "lotte"), "マルちゃん": ("東洋水産（マルちゃん）", "maruchan"), "東洋水産": ("東洋水産（マルちゃん）", "maruchan"),
    "山崎製パン": ("山崎製パン", "yamazaki"), "ヤマザキ": ("山崎製パン", "yamazaki"),
    "雪印": ("雪印メグミルク", "snowbrand"), "日本ハム": ("日本ハム", "nipponham"),
    "伊藤ハム": ("伊藤ハム", "itoham"), "キユーピー": ("キユーピー", "kewpie"), "キューピー": ("キユーピー", "kewpie"),
    "ネスレ": ("ネスレ", "nestle"),
    # 飲料
    "サントリー": ("サントリー", "suntory"), "キリン": ("キリン", "kirin"),
    "アサヒ": ("アサヒ", "asahi"), "コカコーラ": ("コカコーラ", "cocacola"), "コカ・コーラ": ("コカコーラ", "cocacola"),
    "伊藤園": ("伊藤園", "itoen"), "サッポロ": ("サッポロビール", "sapporo"), "ダイドー": ("ダイドー", "dydo"),
    # テーマパーク
    "ディズニーランド": ("東京ディズニーリゾート", "tdr"), "ディズニーシー": ("東京ディズニーリゾート", "tdr"),
    "東京ディズニー": ("東京ディズニーリゾート", "tdr"), "ディズニーリゾート": ("東京ディズニーリゾート", "tdr"),
    "ユニバーサル・スタジオ": ("ユニバーサル・スタジオ・ジャパン", "usj"), "ユニバ": ("ユニバーサル・スタジオ・ジャパン", "usj"), "USJ": ("ユニバーサル・スタジオ・ジャパン", "usj"),
    "富士急ハイランド": ("富士急ハイランド", "fujiq"), "富士急": ("富士急ハイランド", "fujiq"),
    "ナガシマスパーランド": ("ナガシマスパーランド", "nagashima"),
    "ハウステンボス": ("ハウステンボス", "huistenbosch"),
    "サンリオピューロランド": ("サンリオピューロランド", "puroland"), "ピューロランド": ("サンリオピューロランド", "puroland"),
    "よみうりランド": ("よみうりランド", "yomiuriland"), "花やしき": ("浅草花やしき", "hanayashiki"),
    "レゴランド": ("レゴランド・ジャパン", "legoland"), "ジブリパーク": ("ジブリパーク", "ghibli"),
    "シーパラダイス": ("横浜・八景島シーパラダイス", "seaparadise"), "八景島": ("横浜・八景島シーパラダイス", "seaparadise"),
    # レジャー施設
    "すみだ水族館": ("すみだ水族館", "sumida_aq"), "美ら海水族館": ("美ら海水族館", "churaumi"),
    "海遊館": ("海遊館", "kaiyukan"), "上野動物園": ("上野動物園", "ueno_zoo"),
    # 公共交通
    "JR東日本": ("JR東日本", "jr_east"), "JR西日本": ("JR西日本", "jr_west"), "JR東海": ("JR東海", "jr_central"),
    "東京メトロ": ("東京メトロ", "tokyo_metro"), "都営地下鉄": ("都営地下鉄", "toei"),
    "小田急": ("小田急電鉄", "odakyu"), "東急": ("東急電鉄", "tokyu"), "京王": ("京王電鉄", "keio"),
    "西武鉄道": ("西武鉄道", "seibu"), "東武鉄道": ("東武鉄道", "tobu"), "京急": ("京急電鉄", "keikyu"),
    "阪急": ("阪急電鉄", "hankyu"), "近鉄": ("近鉄", "kintetsu"), "Osaka Metro": ("Osaka Metro", "osaka_metro"), "大阪メトロ": ("Osaka Metro", "osaka_metro"),
    "ANA": ("ANA", "ana"), "全日空": ("ANA", "ana"), "JAL": ("JAL", "jal"), "日本航空": ("JAL", "jal"),
    # お得パス
    "青春18きっぷ": ("青春18きっぷ", "seishun18"), "18きっぷ": ("青春18きっぷ", "seishun18"),
    "Suica": ("Suica", "suica"), "PASMO": ("PASMO", "pasmo"),
    # 銭湯・温泉
    "おふろの王様": ("おふろの王様", "ofuro_osama"), "極楽湯": ("極楽湯", "gokurakuyu"),
    "らくスパ": ("らくスパ", "rakuspa"), "大江戸温泉物語": ("大江戸温泉物語", "oedo_onsen"), "大江戸温泉": ("大江戸温泉物語", "oedo_onsen"),
    "ラクーア": ("スパ ラクーア", "laqua"), "ユネッサン": ("箱根小涌園ユネッサン", "yunessun"),
    # アクティビティ
    "ラウンドワン": ("ラウンドワン", "round1"), "ROUND1": ("ラウンドワン", "round1"),
    "まねきねこ": ("カラオケまねきねこ", "manekineko"), "ビッグエコー": ("ビッグエコー", "bigecho"),
    "JOYSOUND": ("JOYSOUND直営店", "joysound"),
    "TOHOシネマズ": ("TOHOシネマズ", "toho_cinemas"), "イオンシネマ": ("イオンシネマ", "aeon_cinema"), "ユナイテッド・シネマ": ("ユナイテッド・シネマ", "united_cinemas"),
    # 日用品
    "花王": ("花王", "kao"), "ライオン": ("ライオン", "lion"), "P&G": ("P&G", "pg"),
    "ユニ・チャーム": ("ユニ・チャーム", "unicharm"), "ユニチャーム": ("ユニ・チャーム", "unicharm"),
    "小林製薬": ("小林製薬", "kobayashi"), "資生堂": ("資生堂", "shiseido"),
    "エステー": ("エステー", "st_corp"), "大王製紙": ("大王製紙（エリエール）", "daio"), "エリエール": ("大王製紙（エリエール）", "daio"),
    "ネピア": ("王子ネピア", "nepia"),
    "うまい棒": ("やおきん", "yaokin"), "やおきん": ("やおきん", "yaokin"),
    "ガリガリ君": ("赤城乳業", "akagi"), "赤城乳業": ("赤城乳業", "akagi"),
}


def detect_company(text: str):
    for alias, info in COMPANY_MASTER.items():
        if alias in text:
            return {"name": info[0], "slug": info[1]}
    return {"name": "Unknown", "slug": "unknown"}


# =====================
# RSS（情報元を大幅追加）
# =====================
RSS_URLS = [
    # Yahoo!ニュース
    "https://news.yahoo.co.jp/rss/topics/business.xml",
    "https://news.yahoo.co.jp/rss/topics/domestic.xml",
    "https://news.yahoo.co.jp/rss/categories/business.xml",
    "https://news.yahoo.co.jp/rss/categories/domestic.xml",
    "https://news.yahoo.co.jp/rss/categories/life.xml",
    # NHK
    "https://www3.nhk.or.jp/rss/news/cat5.xml",   # 経済
    "https://www3.nhk.or.jp/rss/news/cat1.xml",   # 社会
    "https://www3.nhk.or.jp/rss/news/cat6.xml",   # 暮らし
    # ITmedia / 教育・ビジネス系
    "https://rss.itmedia.co.jp/rss/2.0/businessmedia.xml",
    "https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml",
    # 共同通信
    "https://www.47news.jp/rss/national.rdf",
    "https://www.47news.jp/rss/economics.rdf",
    # 食品産業新聞
    "https://www.ssnp.co.jp/feed/",
    # トラベルWatch（交通・レジャー値上げ）
    "https://travel.watch.impress.co.jp/data/rss/1.0/ctw/feed.rdf",
    # マイナビニュース 経済
    "https://news.mynavi.jp/rss/economy",
    # 追加ソース
    "https://news.yahoo.co.jp/rss/categories/economy.xml",
    "https://www3.nhk.or.jp/rss/news/cat0.xml",   # 主要
    "https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml",
    "https://www.ssnp.co.jp/category/news/feed/",  # 食品産業新聞ニュース
    "https://www.ryutsuu.biz/feed/index.xml",      # 流通ニュース
    "https://www.watch.impress.co.jp/data/rss/1.0/ipw/feed.rdf",  # Impress Watch
    "https://gendai.media/list/feed/rss",          # 現代ビジネス
    "https://toyokeizai.net/list/feed/rss",        # 東洋経済オンライン
    "https://diamond.jp/list/feed/rss/dol",        # ダイヤモンドオンライン
    "https://www.jiji.com/rss/ranking.rdf",        # 時事通信
]

KEYWORDS = ["値上げ", "値下げ", "価格改定", "価格変更", "価格変動", "改定", "料金改定",
            "運賃改定", "入場料", "値上がり", "高騰", "改定額", "新価格"]

# 値下げ系キーワード（change_type 判定用）
DECREASE_KEYWORDS = ["値下げ", "半額", "割引", "お得", "安く", "下げる", "引き下げ"]


# =====================
# 日付抽出ユーティリティ
# =====================
def parse_rss_date(item):
    """RSS の pubDate / dc:date を YYYY-MM-DD で返す。取れなければ None。"""
    for tag_name in ["pubDate", "date", "dc:date", "published", "updated"]:
        tag = item.find(tag_name)
        if tag and tag.text:
            raw = tag.text.strip()
            m = re.search(r"(\d{1,2})\s+(\w{3})\s+(\d{4})", raw)
            if m:
                months = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
                          "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12}
                day, mon, year = int(m.group(1)), months.get(m.group(2), 1), int(m.group(3))
                return f"{year:04d}-{mon:02d}-{day:02d}"
            m = re.search(r"(\d{4})-(\d{2})-(\d{2})", raw)
            if m:
                return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
    return None  # 取れなければ NULL（今日で埋めない）


def extract_change_date(text):
    """記事本文から実施日を抽出。見つからなければ None を返す（今日で埋めない）。"""
    current_year = NOW.year

    # パターン1: 2026年4月1日から / より
    m = re.search(r"(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日(?:から|より|以降|実施|改定|出荷分|納品分)", text)
    if m:
        return f"{int(m.group(1)):04d}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"

    # パターン2: 4月1日から（年なし → 推定）
    m = re.search(r"(\d{1,2})月\s*(\d{1,2})日(?:から|より|以降|実施|改定|出荷分|納品分)", text)
    if m:
        month, day = int(m.group(1)), int(m.group(2))
        year = current_year
        if month < NOW.month - 6:
            year += 1
        try:
            import datetime as _dt
            _dt.date(year, month, day)
            return f"{year:04d}-{month:02d}-{day:02d}"
        except Exception:
            pass

    # パターン3: 2026年4月から（日なし）
    m = re.search(r"(\d{4})年\s*(\d{1,2})月(?:から|より|以降|実施|改定)", text)
    if m:
        return f"{int(m.group(1)):04d}-{int(m.group(2)):02d}-01"

    # パターン4: 4月から（年日なし）
    m = re.search(r"(\d{1,2})月(?:から|より|以降|実施|改定)", text)
    if m:
        month = int(m.group(1))
        year = current_year
        if month < NOW.month - 6:
            year += 1
        return f"{year:04d}-{month:02d}-01"

    return None  # 不明 → NULL


def extract_amount(text):
    """記事本文から内容量を抽出。見つからなければ None。
    例: 60g / 1.5L / 350ml / 12本入 / 10枚"""
    patterns = [
        r"(\d+(?:\.\d+)?\s*(?:kg|g|グラム))",
        r"(\d+(?:\.\d+)?\s*(?:ml|mL|L|リットル))",
        r"(\d+\s*(?:本|枚|個|袋|包|食|缶|錠)入?)",
    ]
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            return m.group(1).replace(" ", "")
    return None


def log_run(status: str, found: int, inserted: int, message: str = ""):
    """実行ログを bot_runs テーブルに記録（稼働監視用）。
    テーブルが無い場合は握りつぶす。"""
    try:
        supabase.table("bot_runs").insert({
            "ran_at": NOW.isoformat(),
            "status": status,
            "items_found": found,
            "items_inserted": inserted,
            "message": message[:500],
        }).execute()
    except Exception as e:
        print(f"[log_run] skip: {e}")


# =====================
# MAIN
# =====================
def main():
    all_items = []
    source_ok = 0
    for rss_url in RSS_URLS:
        try:
            res = requests.get(rss_url, timeout=15, headers={"User-Agent": "Mozilla/5.0 (NeageWatchBot)"})
            soup = BeautifulSoup(res.content, "xml")
            items = soup.find_all("item")
            if not items:
                items = soup.find_all("entry")  # Atom
            all_items.extend(items)
            source_ok += 1
            print(f"RSS OK: {rss_url} ({len(items)}件)")
        except Exception as e:
            print(f"RSS ERROR: {rss_url} - {e}")

    print(f"\n総アイテム数: {len(all_items)} / ソース成功: {source_ok}/{len(RSS_URLS)}\n")

    inserted = 0
    matched = 0

    for item in all_items:
        title_tag = item.find("title")
        link_tag = item.find("link")
        if not title_tag:
            continue
        title = title_tag.text.replace(" - Yahoo!ニュース", "").strip()

        # link（Atom は href 属性のことがある）
        if link_tag and link_tag.text.strip():
            link = link_tag.text.strip()
        elif link_tag and link_tag.get("href"):
            link = link_tag.get("href")
        else:
            continue

        if not any(k in title for k in KEYWORDS):
            continue
        matched += 1

        article_date = parse_rss_date(item)

        # 本文取得
        article_text = ""
        try:
            ares = requests.get(link, allow_redirects=True, timeout=15,
                                headers={"User-Agent": "Mozilla/5.0"})
            asoup = BeautifulSoup(ares.text, "html.parser")
            for tag in asoup.find_all(["p", "article", "section"]):
                t = tag.get_text(strip=True)
                if len(t) > 20:
                    article_text += t + "\n"
            article_text = article_text[:4000]
        except Exception as e:
            print(f"ARTICLE ERROR: {e}")
            continue

        company = detect_company(title)
        if company["slug"] == "unknown":
            company = detect_company(article_text)
        if company["slug"] == "unknown":
            continue

        product = title
        for k in KEYWORDS:
            product = product.replace(k, "")
        product = product.strip("　 ・:：、。").strip()
        if not product:
            product = f"{company['name']}の価格改定"

        prices = re.findall(r"([\d,]+)\s*円", article_text)
        prices = [int(p.replace(",", "")) for p in prices if p.replace(",", "").isdigit()]
        prices = [p for p in prices if 10 <= p <= 100000]  # 異常値除外

        if len(prices) < 2:
            tprices = re.findall(r"([\d,]+)\s*円", title)
            tprices = [int(p.replace(",", "")) for p in tprices if p.replace(",", "").isdigit()]
            prices = tprices if len(tprices) >= 2 else prices
        if len(prices) < 2:
            print(f"価格不足スキップ: {title}")
            continue

        old_price, new_price = prices[0], prices[1]

        is_decrease = any(k in title or k in article_text[:200] for k in DECREASE_KEYWORDS)
        change_type = "decrease" if (is_decrease or new_price < old_price) else "increase"

        change_date = extract_change_date(article_text)
        amount = extract_amount(article_text)

        # 重複チェック
        existing = supabase.table("price_changes").select("id").eq("source_url", link).execute()
        if existing.data:
            continue

        data = {
            "company": company["name"],
            "slug": company["slug"],
            "product": product[:120],
            "old_price": old_price,
            "new_price": new_price,
            "change_type": change_type,
            "source_url": link,
            "article_text": article_text,
            "article_date": article_date,   # 取れなければ None
            "change_date": change_date,     # 取れなければ None
            "amount": amount,               # 取れなければ None
            "is_verified": False,
        }
        try:
            supabase.table("price_changes").insert(data).execute()
            inserted += 1
            print(f"✅ INSERT: {company['name']} {product[:30]} {old_price}→{new_price} (実施:{change_date} 量:{amount})")
        except Exception as e:
            print(f"INSERT ERROR: {e}")

    print(f"\n=== 完了: マッチ{matched}件 / 新規{inserted}件 ===")
    log_run("success", matched, inserted, f"sources {source_ok}/{len(RSS_URLS)}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"FATAL: {e}")
        log_run("error", 0, 0, str(e))
        sys.exit(1)
