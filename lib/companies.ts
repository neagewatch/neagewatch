export const COMPANIES = {
  mcdonalds: {
    name: "マクドナルド",
    slug: "mcdonalds",
    aliases: ["マクドナルド", "マック", "マクド", "McDonald's"]
  },
  seven: {
    name: "セブンイレブン",
    slug: "seven",
    aliases: ["セブン", "セブンイレブン", "7-11", "セブン-イレブン"]
  },
  familymart: {
    name: "ファミリーマート",
    slug: "familymart",
    aliases: ["ファミマ", "ファミリーマート"]
  },
  lawson: {
    name: "ローソン",
    slug: "lawson",
    aliases: ["ローソン"]
  },
  nissin: {
    name: "日清",
    slug: "nissin",
    aliases: ["日清", "カップヌードル"]
  },
  meiji: {
    name: "明治",
    slug: "meiji",
    aliases: ["明治"]
  },
  yoshinoya: {
    name: "吉野家",
    slug: "yoshinoya",
    aliases: ["吉野家"]
  },
  sukiya: {
    name: "すき家",
    slug: "sukiya",
    aliases: ["すき家"]
  },
  matsuya: {
    name: "松屋",
    slug: "matsuya",
    aliases: ["松屋"]
  },
  mos: {
    name: "モスバーガー",
    slug: "mos",
    aliases: ["モスバーガー", "モス"]
  },
  kfc: {
    name: "ケンタッキー",
    slug: "kfc",
    aliases: ["ケンタッキー", "KFC", "ケンタ"]
  },
  saizeriya: {
    name: "サイゼリヤ",
    slug: "saizeriya",
    aliases: ["サイゼリヤ", "サイゼ"]
  },
  aeon: {
    name: "イオン",
    slug: "aeon",
    aliases: ["イオン", "AEON"]
  },
  seiyu: {
    name: "西友",
    slug: "seiyu",
    aliases: ["西友"]
  },
  donki: {
    name: "ドン・キホーテ",
    slug: "donki",
    aliases: ["ドン・キホーテ", "ドンキ", "ドンキホーテ"]
  },
  costco: {
    name: "コストコ",
    slug: "costco",
    aliases: ["コストコ"]
  },
  calbee: {
    name: "カルビー",
    slug: "calbee",
    aliases: ["カルビー"]
  },
  glico: {
    name: "江崎グリコ",
    slug: "glico",
    aliases: ["グリコ", "江崎グリコ"]
  },
  morinaga: {
    name: "森永",
    slug: "morinaga",
    aliases: ["森永"]
  },
  house: {
    name: "ハウス食品",
    slug: "house",
    aliases: ["ハウス食品", "ハウス"]
  },
  kikkoman: {
    name: "キッコーマン",
    slug: "kikkoman",
    aliases: ["キッコーマン"]
  },
  ajinomoto: {
    name: "味の素",
    slug: "ajinomoto",
    aliases: ["味の素"]
  },
  suntory: {
    name: "サントリー",
    slug: "suntory",
    aliases: ["サントリー"]
  },
  kirin: {
    name: "キリン",
    slug: "kirin",
    aliases: ["キリン", "キリンビール"]
  },
  asahi: {
    name: "アサヒ",
    slug: "asahi",
    aliases: ["アサヒ", "アサヒビール"]
  },
  cocacola: {
    name: "コカコーラ",
    slug: "cocacola",
    aliases: ["コカコーラ", "コカ・コーラ"]
  },
  uniqlo: {
    name: "ユニクロ",
    slug: "uniqlo",
    aliases: ["ユニクロ", "UNIQLO"]
  },
  muji: {
    name: "無印良品",
    slug: "muji",
    aliases: ["無印良品", "無印", "MUJI"]
  },
  starbucks: {
    name: "スターバックス",
    slug: "starbucks",
    aliases: ["スターバックス", "スタバ"]
  },
  lotte: {
  name: "ロッテ",
  slug: "lotte",
  aliases: ["ロッテ"]
},
} as const

export type CompanyId = keyof typeof COMPANIES
export type CompanySlug = typeof COMPANIES[CompanyId]["slug"]