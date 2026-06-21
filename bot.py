import os
import re
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
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# =====================
# 企業マスタ（唯一の辞書）
# =====================

COMPANY_MASTER = {
    "マクドナルド":    {"name": "マクドナルド",    "slug": "mcdonalds"},
    "マック":          {"name": "マクドナルド",    "slug": "mcdonalds"},
    "マクド":          {"name": "マクドナルド",    "slug": "mcdonalds"},
    "セブンイレブン":  {"name": "セブンイレブン",  "slug": "seven"},
    "セブン":          {"name": "セブンイレブン",  "slug": "seven"},
    "ファミリーマート":{"name": "ファミリーマート","slug": "familymart"},
    "ファミマ":        {"name": "ファミリーマート","slug": "familymart"},
    "ローソン":        {"name": "ローソン",        "slug": "lawson"},
    "日清":            {"name": "日清",            "slug": "nissin"},
    "カップヌードル":  {"name": "日清",            "slug": "nissin"},
    "明治":            {"name": "明治",            "slug": "meiji"},
    "吉野家":          {"name": "吉野家",          "slug": "yoshinoya"},
    "すき家":          {"name": "すき家",          "slug": "sukiya"},
    "松屋":            {"name": "松屋",            "slug": "matsuya"},
    "モスバーガー":    {"name": "モスバーガー",    "slug": "mos"},
    "モス":            {"name": "モスバーガー",    "slug": "mos"},
    "ケンタッキー":    {"name": "ケンタッキー",    "slug": "kfc"},
    "KFC":             {"name": "ケンタッキー",    "slug": "kfc"},
    "ケンタ":          {"name": "ケンタッキー",    "slug": "kfc"},
    "サイゼリヤ":      {"name": "サイゼリヤ",      "slug": "saizeriya"},
    "サイゼ":          {"name": "サイゼリヤ",      "slug": "saizeriya"},
    "イオン":          {"name": "イオン",          "slug": "aeon"},
    "西友":            {"name": "西友",            "slug": "seiyu"},
    "ドン・キホーテ":  {"name": "ドン・キホーテ",  "slug": "donki"},
    "ドンキ":          {"name": "ドン・キホーテ",  "slug": "donki"},
    "コストコ":        {"name": "コストコ",        "slug": "costco"},
    "カルビー":        {"name": "カルビー",        "slug": "calbee"},
    "グリコ":          {"name": "江崎グリコ",      "slug": "glico"},
    "江崎グリコ":      {"name": "江崎グリコ",      "slug": "glico"},
    "森永":            {"name": "森永",            "slug": "morinaga"},
    "ハウス食品":      {"name": "ハウス食品",      "slug": "house"},
    "ハウス":          {"name": "ハウス食品",      "slug": "house"},
    "キッコーマン":    {"name": "キッコーマン",    "slug": "kikkoman"},
    "味の素":          {"name": "味の素",          "slug": "ajinomoto"},
    "サントリー":      {"name": "サントリー",      "slug": "suntory"},
    "キリン":          {"name": "キリン",          "slug": "kirin"},
    "キリンビール":    {"name": "キリン",          "slug": "kirin"},
    "アサヒ":          {"name": "アサヒ",          "slug": "asahi"},
    "アサヒビール":    {"name": "アサヒ",          "slug": "asahi"},
    "コカコーラ":      {"name": "コカコーラ",      "slug": "cocacola"},
    "コカ・コーラ":    {"name": "コカコーラ",      "slug": "cocacola"},
    "ユニクロ":        {"name": "ユニクロ",        "slug": "uniqlo"},
    "無印良品":        {"name": "無印良品",        "slug": "muji"},
    "無印":            {"name": "無印良品",        "slug": "muji"},
    "スターバックス":  {"name": "スターバックス",  "slug": "starbucks"},
    "スタバ":          {"name": "スターバックス",  "slug": "starbucks"},
}

def detect_company(text: str) -> dict:
    for alias, info in COMPANY_MASTER.items():
        if alias in text:
            return info
    return {"name": "Unknown", "slug": "unknown"}

# =====================
# RSS
# =====================

URL = "https://news.yahoo.co.jp/rss/topics/business.xml"

res = requests.get(URL)
soup = BeautifulSoup(res.content, "xml")
items = soup.find_all("item")

# =====================
# KEYWORDS
# =====================

keywords = ["値上げ", "値下げ", "価格改定", "価格変更", "半額", "価格"]

# =====================
# LOOP
# =====================

for item in items:
    title = item.title.text.replace(" - Yahoo!ニュース", "")
    link = item.link.text

    print("==========")
    print("RSS:", title)

    if not any(k in title for k in keywords):
        continue

# 記事取得（リダイレクト先の元記事を取得）
    article_text = ""
    try:
        article_res = requests.get(
            link,
            allow_redirects=True,
            timeout=10,
            headers={"User-Agent": "Mozilla/5.0"}
        )
        final_url = article_res.url
        print("最終URL:", final_url)

        article_soup = BeautifulSoup(article_res.text, "html.parser")

        # 本文候補タグを広げて取得
        for tag in article_soup.find_all(["p", "article", "section"]):
            text = tag.get_text(strip=True)
            if len(text) > 20:  # 短すぎる断片は除外
                article_text += text + "\n"

        article_text = article_text[:3000]  # 長すぎる場合は切る
        print("本文取得OK（文字数:)", len(article_text), ")")

       

    except Exception as e:
        print("ARTICLE ERROR:", e)
        continue

        

    # 企業判定（タイトル→本文の順で検索）
    company_info = detect_company(title) or detect_company(article_text)
    print("企業:", company_info)

    # unknown はスキップ
    if company_info["slug"] == "unknown":
        print("企業不明 → スキップ")
        continue

    # 商品名
    product_name = title
    for k in keywords:
        product_name = product_name.replace(k, "")
    product_name = product_name.strip()

    # 価格抽出（円表記を優先）
    prices = re.findall(r"(\d+)円", article_text)

    if len(prices) < 2:
        print("価格情報なし → スキップ")
        continue

    old_price = int(prices[0])
    new_price = int(prices[1])

# 重複チェック
    existing = supabase.table("price_changes").select("id").eq("source_url", link).execute()

    if existing.data:
        print("重複 → スキップ")
        continue

    # 保存
    data = {
        "company": company_info["name"],
        "slug": company_info["slug"],
        "product": product_name,
        "old_price": old_price,
        "new_price": new_price,
        "change_type": "increase",
        "source_url": link,
        "article_text": article_text,
    }

    print("保存:", data)

    try:
        supabase.table("price_changes").insert(data).execute()
        print("INSERT成功")
    except Exception as e:
        print("INSERT ERROR:", e)