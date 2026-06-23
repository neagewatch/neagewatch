// 企業マスタ（フロント側の唯一の辞書）
// category は UI のグルーピングに使用
export const COMPANIES = {
  // ===== 外食 =====
  mcdonalds: { name: "マクドナルド", slug: "mcdonalds", category: "外食", aliases: ["マクドナルド", "マック", "マクド", "McDonald's"] },
  yoshinoya: { name: "吉野家", slug: "yoshinoya", category: "外食", aliases: ["吉野家"] },
  sukiya: { name: "すき家", slug: "sukiya", category: "外食", aliases: ["すき家"] },
  matsuya: { name: "松屋", slug: "matsuya", category: "外食", aliases: ["松屋"] },
  mos: { name: "モスバーガー", slug: "mos", category: "外食", aliases: ["モスバーガー", "モス"] },
  kfc: { name: "ケンタッキー", slug: "kfc", category: "外食", aliases: ["ケンタッキー", "KFC", "ケンタ"] },
  saizeriya: { name: "サイゼリヤ", slug: "saizeriya", category: "外食", aliases: ["サイゼリヤ", "サイゼ"] },
  starbucks: { name: "スターバックス", slug: "starbucks", category: "外食", aliases: ["スターバックス", "スタバ"] },
  gusto: { name: "ガスト", slug: "gusto", category: "外食", aliases: ["ガスト"] },
  ootoya: { name: "大戸屋", slug: "ootoya", category: "外食", aliases: ["大戸屋"] },
  cocoichi: { name: "CoCo壱番屋", slug: "cocoichi", category: "外食", aliases: ["CoCo壱番屋", "ココイチ", "ココ壱"] },
  tendon_tenya: { name: "天丼てんや", slug: "tenya", category: "外食", aliases: ["てんや", "天丼てんや"] },
  ringerhut: { name: "リンガーハット", slug: "ringerhut", category: "外食", aliases: ["リンガーハット"] },
  ohsho: { name: "餃子の王将", slug: "ohsho", category: "外食", aliases: ["餃子の王将", "王将"] },
  hidakaya: { name: "日高屋", slug: "hidakaya", category: "外食", aliases: ["日高屋"] },
  yayoiken: { name: "やよい軒", slug: "yayoiken", category: "外食", aliases: ["やよい軒"] },
  ichiran: { name: "一蘭", slug: "ichiran", category: "外食", aliases: ["一蘭"] },
  ippudo: { name: "一風堂", slug: "ippudo", category: "外食", aliases: ["一風堂"] },
  marugame: { name: "丸亀製麺", slug: "marugame", category: "外食", aliases: ["丸亀製麺", "丸亀"] },
  komeda: { name: "コメダ珈琲店", slug: "komeda", category: "外食", aliases: ["コメダ珈琲", "コメダ"] },
  doutor: { name: "ドトール", slug: "doutor", category: "外食", aliases: ["ドトール"] },
  tullys: { name: "タリーズコーヒー", slug: "tullys", category: "外食", aliases: ["タリーズ"] },
  freshness: { name: "フレッシュネスバーガー", slug: "freshness", category: "外食", aliases: ["フレッシュネスバーガー", "フレッシュネス"] },
  lotteria: { name: "ロッテリア", slug: "lotteria", category: "外食", aliases: ["ロッテリア"] },
  bikkuri_donkey: { name: "びっくりドンキー", slug: "bikkuridonkey", category: "外食", aliases: ["びっくりドンキー"] },
  ootoya2: { name: "大阪王将", slug: "osaka_ohsho", category: "外食", aliases: ["大阪王将"] },

  // ===== 回転寿司・寿司 =====
  sushiro: { name: "スシロー", slug: "sushiro", category: "寿司", aliases: ["スシロー"] },
  kurazushi: { name: "くら寿司", slug: "kurazushi", category: "寿司", aliases: ["くら寿司", "無添くら寿司"] },
  hamazushi: { name: "はま寿司", slug: "hamazushi", category: "寿司", aliases: ["はま寿司"] },
  kappa: { name: "かっぱ寿司", slug: "kappazushi", category: "寿司", aliases: ["かっぱ寿司"] },
  ganko: { name: "がってん寿司", slug: "gatten", category: "寿司", aliases: ["がってん寿司"] },
  uobei: { name: "魚べい", slug: "uobei", category: "寿司", aliases: ["魚べい"] },

  // ===== コンビニ =====
  seven: { name: "セブンイレブン", slug: "seven", category: "コンビニ", aliases: ["セブン", "セブンイレブン", "7-11", "セブン-イレブン"] },
  familymart: { name: "ファミリーマート", slug: "familymart", category: "コンビニ", aliases: ["ファミマ", "ファミリーマート"] },
  lawson: { name: "ローソン", slug: "lawson", category: "コンビニ", aliases: ["ローソン"] },
  ministop: { name: "ミニストップ", slug: "ministop", category: "コンビニ", aliases: ["ミニストップ"] },

  // ===== 小売・スーパー =====
  aeon: { name: "イオン", slug: "aeon", category: "小売", aliases: ["イオン", "AEON"] },
  seiyu: { name: "西友", slug: "seiyu", category: "小売", aliases: ["西友"] },
  donki: { name: "ドン・キホーテ", slug: "donki", category: "小売", aliases: ["ドン・キホーテ", "ドンキ", "ドンキホーテ"] },
  costco: { name: "コストコ", slug: "costco", category: "小売", aliases: ["コストコ"] },
  uniqlo: { name: "ユニクロ", slug: "uniqlo", category: "小売", aliases: ["ユニクロ", "UNIQLO"] },
  muji: { name: "無印良品", slug: "muji", category: "小売", aliases: ["無印良品", "無印", "MUJI"] },
  gu: { name: "GU", slug: "gu", category: "小売", aliases: ["ジーユー", "GU"] },
  nitori: { name: "ニトリ", slug: "nitori", category: "小売", aliases: ["ニトリ"] },
  daiso: { name: "ダイソー", slug: "daiso", category: "小売", aliases: ["ダイソー", "DAISO"] },
  seria: { name: "セリア", slug: "seria", category: "小売", aliases: ["セリア", "Seria"] },
  ikea: { name: "IKEA", slug: "ikea", category: "小売", aliases: ["イケア", "IKEA"] },
  yodobashi: { name: "ヨドバシカメラ", slug: "yodobashi", category: "小売", aliases: ["ヨドバシカメラ", "ヨドバシ"] },
  bic: { name: "ビックカメラ", slug: "biccamera", category: "小売", aliases: ["ビックカメラ"] },

  // ===== 食品メーカー =====
  nissin: { name: "日清", slug: "nissin", category: "食品メーカー", aliases: ["日清", "カップヌードル", "日清食品"] },
  meiji: { name: "明治", slug: "meiji", category: "食品メーカー", aliases: ["明治"] },
  calbee: { name: "カルビー", slug: "calbee", category: "食品メーカー", aliases: ["カルビー"] },
  glico: { name: "江崎グリコ", slug: "glico", category: "食品メーカー", aliases: ["グリコ", "江崎グリコ"] },
  morinaga: { name: "森永", slug: "morinaga", category: "食品メーカー", aliases: ["森永"] },
  house: { name: "ハウス食品", slug: "house", category: "食品メーカー", aliases: ["ハウス食品", "ハウス"] },
  kikkoman: { name: "キッコーマン", slug: "kikkoman", category: "食品メーカー", aliases: ["キッコーマン"] },
  ajinomoto: { name: "味の素", slug: "ajinomoto", category: "食品メーカー", aliases: ["味の素"] },
  lotte: { name: "ロッテ", slug: "lotte", category: "食品メーカー", aliases: ["ロッテ"] },
  nisshin_seifun: { name: "日清製粉", slug: "nisshin_seifun", category: "食品メーカー", aliases: ["日清製粉"] },
  maruchan: { name: "東洋水産（マルちゃん）", slug: "maruchan", category: "食品メーカー", aliases: ["マルちゃん", "東洋水産"] },
  yamazaki: { name: "山崎製パン", slug: "yamazaki", category: "食品メーカー", aliases: ["山崎製パン", "ヤマザキ"] },
  snowbrand: { name: "雪印メグミルク", slug: "snowbrand", category: "食品メーカー", aliases: ["雪印メグミルク", "雪印"] },
  nippon_ham: { name: "日本ハム", slug: "nipponham", category: "食品メーカー", aliases: ["日本ハム", "ニッポンハム"] },
  itoham: { name: "伊藤ハム", slug: "itoham", category: "食品メーカー", aliases: ["伊藤ハム"] },
  kewpie: { name: "キユーピー", slug: "kewpie", category: "食品メーカー", aliases: ["キユーピー", "キューピー"] },
  nestle: { name: "ネスレ", slug: "nestle", category: "食品メーカー", aliases: ["ネスレ", "Nestle"] },

  // ===== 飲料 =====
  suntory: { name: "サントリー", slug: "suntory", category: "飲料", aliases: ["サントリー"] },
  kirin: { name: "キリン", slug: "kirin", category: "飲料", aliases: ["キリン", "キリンビール"] },
  asahi: { name: "アサヒ", slug: "asahi", category: "飲料", aliases: ["アサヒ", "アサヒビール"] },
  cocacola: { name: "コカコーラ", slug: "cocacola", category: "飲料", aliases: ["コカコーラ", "コカ・コーラ"] },
   itoen: { name: "伊藤園", slug: "itoen", category: "飲料", aliases: ["伊藤園"] },
  sapporo: { name: "サッポロビール", slug: "sapporo", category: "飲料", aliases: ["サッポロビール", "サッポロ"] },
  dydo: { name: "ダイドー", slug: "dydo", category: "飲料", aliases: ["ダイドー", "DyDo"] },

  // ===== テーマパーク・レジャー施設 =====
  tdr: { name: "東京ディズニーリゾート", slug: "tdr", category: "テーマパーク", aliases: ["ディズニーランド", "ディズニーシー", "東京ディズニー", "ディズニーリゾート", "TDR", "TDL", "TDS"] },
  usj: { name: "ユニバーサル・スタジオ・ジャパン", slug: "usj", category: "テーマパーク", aliases: ["ユニバーサル・スタジオ", "ユニバ", "USJ"] },
  fujiq: { name: "富士急ハイランド", slug: "fujiq", category: "テーマパーク", aliases: ["富士急ハイランド", "富士急"] },
  nagashima: { name: "ナガシマスパーランド", slug: "nagashima", category: "テーマパーク", aliases: ["ナガシマスパーランド", "ナガシマ"] },
  huistenbosch: { name: "ハウステンボス", slug: "huistenbosch", category: "テーマパーク", aliases: ["ハウステンボス"] },
  sanrio_puroland: { name: "サンリオピューロランド", slug: "puroland", category: "テーマパーク", aliases: ["サンリオピューロランド", "ピューロランド"] },
  toshimaen: { name: "としまえん", slug: "toshimaen", category: "テーマパーク", aliases: ["としまえん"] },
  yomiuriland: { name: "よみうりランド", slug: "yomiuriland", category: "テーマパーク", aliases: ["よみうりランド"] },
  hanayashiki: { name: "浅草花やしき", slug: "hanayashiki", category: "テーマパーク", aliases: ["花やしき", "浅草花やしき"] },
  legoland: { name: "レゴランド・ジャパン", slug: "legoland", category: "テーマパーク", aliases: ["レゴランド", "LEGOLAND"] },
  ghibli_park: { name: "ジブリパーク", slug: "ghibli", category: "テーマパーク", aliases: ["ジブリパーク"] },
  seaparadise: { name: "横浜・八景島シーパラダイス", slug: "seaparadise", category: "テーマパーク", aliases: ["シーパラダイス", "八景島"] },

  // ===== 水族館・動物園 =====
  sumida_aquarium: { name: "すみだ水族館", slug: "sumida_aq", category: "レジャー施設", aliases: ["すみだ水族館"] },
  churaumi: { name: "美ら海水族館", slug: "churaumi", category: "レジャー施設", aliases: ["美ら海水族館", "美ら海"] },
  kaiyukan: { name: "海遊館", slug: "kaiyukan", category: "レジャー施設", aliases: ["海遊館"] },
  ueno_zoo: { name: "上野動物園", slug: "ueno_zoo", category: "レジャー施設", aliases: ["上野動物園"] },

  // ===== 公共交通機関 =====
  jr_east: { name: "JR東日本", slug: "jr_east", category: "公共交通", aliases: ["JR東日本", "JR東"] },
  jr_west: { name: "JR西日本", slug: "jr_west", category: "公共交通", aliases: ["JR西日本", "JR西"] },
  jr_central: { name: "JR東海", slug: "jr_central", category: "公共交通", aliases: ["JR東海"] },
  tokyo_metro: { name: "東京メトロ", slug: "tokyo_metro", category: "公共交通", aliases: ["東京メトロ", "メトロ"] },
  toei: { name: "都営地下鉄", slug: "toei", category: "公共交通", aliases: ["都営地下鉄", "都営"] },
  odakyu: { name: "小田急電鉄", slug: "odakyu", category: "公共交通", aliases: ["小田急"] },
  tokyu: { name: "東急電鉄", slug: "tokyu", category: "公共交通", aliases: ["東急電鉄", "東急"] },
  keio: { name: "京王電鉄", slug: "keio", category: "公共交通", aliases: ["京王電鉄", "京王"] },
  seibu: { name: "西武鉄道", slug: "seibu", category: "公共交通", aliases: ["西武鉄道", "西武"] },
  tobu: { name: "東武鉄道", slug: "tobu", category: "公共交通", aliases: ["東武鉄道", "東武"] },
  keikyu: { name: "京急電鉄", slug: "keikyu", category: "公共交通", aliases: ["京急"] },
  hankyu: { name: "阪急電鉄", slug: "hankyu", category: "公共交通", aliases: ["阪急電鉄", "阪急"] },
  kintetsu: { name: "近鉄", slug: "kintetsu", category: "公共交通", aliases: ["近鉄", "近畿日本鉄道"] },
  osaka_metro: { name: "Osaka Metro", slug: "osaka_metro", category: "公共交通", aliases: ["Osaka Metro", "大阪メトロ"] },
  ana: { name: "ANA", slug: "ana", category: "公共交通", aliases: ["ANA", "全日空", "全日本空輸"] },
  jal: { name: "JAL", slug: "jal", category: "公共交通", aliases: ["JAL", "日本航空"] },

  // ===== お得なパス・サブスク =====
  jr_seishun18: { name: "青春18きっぷ", slug: "seishun18", category: "お得パス", aliases: ["青春18きっぷ", "18きっぷ"] },
  suica: { name: "Suica", slug: "suica", category: "お得パス", aliases: ["Suica", "スイカ"] },
  pasmo: { name: "PASMO", slug: "pasmo", category: "お得パス", aliases: ["PASMO", "パスモ"] },

  // ===== 銭湯・温泉・スーパー銭湯 =====
  sento_tokyo: { name: "東京都の銭湯", slug: "sento_tokyo", category: "銭湯・温泉", aliases: ["銭湯", "東京都浴場組合", "公衆浴場"] },
  ofuro_no_osama: { name: "おふろの王様", slug: "ofuro_osama", category: "銭湯・温泉", aliases: ["おふろの王様"] },
  gokurakuyu: { name: "極楽湯", slug: "gokurakuyu", category: "銭湯・温泉", aliases: ["極楽湯"] },
  rakuspa: { name: "らくスパ", slug: "rakuspa", category: "銭湯・温泉", aliases: ["らくスパ", "RAKU SPA"] },
  oedo_onsen: { name: "大江戸温泉物語", slug: "oedo_onsen", category: "銭湯・温泉", aliases: ["大江戸温泉物語", "大江戸温泉"] },
  spa_laqua: { name: "スパ ラクーア", slug: "laqua", category: "銭湯・温泉", aliases: ["ラクーア", "LaQua"] },
  yunessun: { name: "箱根小涌園ユネッサン", slug: "yunessun", category: "銭湯・温泉", aliases: ["ユネッサン", "箱根小涌園"] },

  // ===== アクティビティ・遊ぶところ =====
  round1: { name: "ラウンドワン", slug: "round1", category: "アクティビティ", aliases: ["ラウンドワン", "ROUND1"] },
  karaoke_manekineko: { name: "カラオケまねきねこ", slug: "manekineko", category: "アクティビティ", aliases: ["カラオケまねきねこ", "まねきねこ"] },
  big_echo: { name: "ビッグエコー", slug: "bigecho", category: "アクティビティ", aliases: ["ビッグエコー", "BIG ECHO"] },
  joysound: { name: "JOYSOUND直営店", slug: "joysound", category: "アクティビティ", aliases: ["JOYSOUND"] },
  rascal: { name: "ラスカル（ボウリング）", slug: "bowling", category: "アクティビティ", aliases: ["ボウリング"] },
  toho_cinemas: { name: "TOHOシネマズ", slug: "toho_cinemas", category: "アクティビティ", aliases: ["TOHOシネマズ"] },
  aeon_cinema: { name: "イオンシネマ", slug: "aeon_cinema", category: "アクティビティ", aliases: ["イオンシネマ"] },
  united_cinemas: { name: "ユナイテッド・シネマ", slug: "united_cinemas", category: "アクティビティ", aliases: ["ユナイテッド・シネマ"] },

  // ===== 日用品メーカー =====
  kao: { name: "花王", slug: "kao", category: "日用品", aliases: ["花王", "Kao"] },
  lion: { name: "ライオン", slug: "lion", category: "日用品", aliases: ["ライオン", "LION"] },
  pg: { name: "P&G", slug: "pg", category: "日用品", aliases: ["P&G", "ピーアンドジー"] },
  unicharm: { name: "ユニ・チャーム", slug: "unicharm", category: "日用品", aliases: ["ユニ・チャーム", "ユニチャーム"] },
  kobayashi: { name: "小林製薬", slug: "kobayashi", category: "日用品", aliases: ["小林製薬"] },
  shiseido: { name: "資生堂", slug: "shiseido", category: "日用品", aliases: ["資生堂"] },
  kao_merit: { name: "エステー", slug: "st_corp", category: "日用品", aliases: ["エステー"] },
  daio_paper: { name: "大王製紙（エリエール）", slug: "daio", category: "日用品", aliases: ["大王製紙", "エリエール"] },
  nepia: { name: "王子ネピア", slug: "nepia", category: "日用品", aliases: ["ネピア", "nepia"] },
} as const

export type CompanyId = keyof typeof COMPANIES
export type CompanySlug = typeof COMPANIES[CompanyId]["slug"]

// カテゴリの表示順
export const CATEGORY_ORDER = [
  "外食", "寿司", "コンビニ", "小売", "食品メーカー", "飲料",
  "テーマパーク", "レジャー施設", "公共交通", "お得パス",
  "銭湯・温泉", "アクティビティ", "日用品",
] as const
