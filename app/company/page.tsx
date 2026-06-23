import { createClient } from "@supabase/supabase-js";
import { COMPANIES, CATEGORY_ORDER } from "@/lib/companies";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "企業一覧",
  description: "NeageWatchが追跡する全企業の一覧。外食・寿司・コンビニ・小売・テーマパーク・公共交通・銭湯・日用品など幅広いジャンルの価格変動データを確認できます。",
  openGraph: {
    title: "企業一覧 | NeageWatch",
    description: "値上げ・値下げ情報を追跡中の全企業一覧",
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 300;

export default async function CompanyListPage() {
  const { data } = await supabase.from("price_changes").select("slug");

  const countMap: Record<string, number> = {};
  data?.forEach((item) => { countMap[item.slug] = (countMap[item.slug] || 0) + 1; });

  const list = Object.values(COMPANIES).map((c) => ({
    slug: c.slug, name: c.name, category: c.category, count: countMap[c.slug] || 0,
  }));

  const categories: Record<string, typeof list> = {};
  list.forEach((c) => {
    if (!categories[c.category]) categories[c.category] = [];
    categories[c.category].push(c);
  });

  const orderedCats = [
    ...CATEGORY_ORDER.filter((c) => categories[c]),
    ...Object.keys(categories).filter((c) => !CATEGORY_ORDER.includes(c as typeof CATEGORY_ORDER[number])),
  ];

  return (
    <div className="container">
      <h1 className="page-title">企業一覧</h1>
      <p className="page-sub">登録企業 {list.length}社 ・ データのある企業 {Object.keys(countMap).length}社</p>

      {orderedCats.map((cat) => {
        const companies = categories[cat];
        if (!companies) return null;
        const withData = companies.filter((c) => c.count > 0).length;
        return (
          <div key={cat} style={{ marginBottom: 36 }}>
            <div className="section-head">
              <div className="section-label">{cat}</div>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {companies.length}社 {withData > 0 && `· ${withData}社にデータ`}
              </span>
            </div>
            <div className="grid-3">
              {companies.map((c) => (
                <a key={c.slug} href={`/company/${c.slug}`} className="card" style={{ display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.name}
                    </div>
                    {c.count > 0 && (
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: "2px 9px",
                        background: "var(--accent-light)", color: "var(--accent)",
                        borderRadius: 20, flexShrink: 0,
                      }}>{c.count}</span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 12, marginTop: 6,
                    color: c.count > 0 ? "var(--text-secondary)" : "var(--text-muted)",
                  }}>
                    {c.count > 0 ? `${c.count}件の価格変動` : "データ収集中"}
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
