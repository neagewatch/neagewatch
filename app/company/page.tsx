import { createClient } from "@supabase/supabase-js";
import { COMPANIES } from "@/lib/companies";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function CompanyListPage() {
  const { data } = await supabase.from("price_changes").select("slug, company");

  const countMap: Record<string, number> = {};
  data?.forEach((item) => { countMap[item.slug] = (countMap[item.slug] || 0) + 1; });

  const categories: Record<string, typeof list> = {};
  const list = Object.entries(COMPANIES).map(([key, c]) => ({
    slug: c.slug, name: c.name, category: c.category, count: countMap[c.slug] || 0,
  }));

  list.forEach((c) => {
    if (!categories[c.category]) categories[c.category] = [];
    categories[c.category].push(c);
  });

  return (
    <div className="container">
      <h1 className="page-title">企業一覧</h1>
      <p className="page-sub">登録企業 {list.length}社 ・ データのある企業 {Object.keys(countMap).length}社</p>

      {Object.entries(categories).map(([cat, companies]) => (
        <div key={cat} style={{ marginBottom: 32 }}>
          <div className="section-label">{cat}</div>
          <div className="grid-3">
            {companies.map((c) => (
              <a key={c.slug} href={`/company/${c.slug}`} className="card" style={{
                textDecoration: "none", color: "inherit", display: "block",
              }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</div>
                <div style={{
                  fontSize: 12, marginTop: 8,
                  color: c.count > 0 ? "var(--accent)" : "var(--text-muted)",
                  fontWeight: 600,
                }}>
                  {c.count > 0 ? `${c.count}件のデータ` : "データなし"}
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
