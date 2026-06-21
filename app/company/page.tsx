import { createClient } from "@supabase/supabase-js";
import { COMPANIES } from "@/lib/companies";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function CompanyListPage() {
  const { data } = await supabase
    .from("price_changes")
    .select("slug, company");

  const countMap: Record<string, number> = {};
  data?.forEach((item) => {
    countMap[item.slug] = (countMap[item.slug] || 0) + 1;
  });

  const companyList = Object.entries(COMPANIES).map(([key, company]) => ({
    slug: company.slug,
    name: company.name,
    count: countMap[company.slug] || 0,
  }));

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>企業一覧</h1>
        <p style={styles.sub}>登録企業: {companyList.length}社</p>

        <div style={styles.grid}>
          {companyList.map((c) => (
            <a key={c.slug} href={`/company/${c.slug}`} style={styles.card}>
              <div style={styles.name}>{c.name}</div>
              <div style={styles.count}>{c.count}件のデータ</div>
            </a>
          ))}
        </div>
      </div>

      <a href="/" style={styles.back}>← ダッシュボードに戻る</a>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f6f7f9", fontFamily: "system-ui", padding: 40 },
  container: { maxWidth: 900, margin: "0 auto" },
  title: { fontSize: 28, fontWeight: 800 },
  sub: { color: "#666", marginTop: 4, marginBottom: 24 },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    textDecoration: "none",
    color: "#111",
  },
  name: { fontSize: 18, fontWeight: 700 },
  count: { fontSize: 13, color: "#888", marginTop: 6 },
  back: { display: "block", maxWidth: 900, margin: "30px auto 0", color: "#2563eb", textDecoration: "none", fontWeight: 600 },
};
