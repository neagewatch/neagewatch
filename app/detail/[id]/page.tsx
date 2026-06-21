import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabase
    .from("price_changes")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) {
    return (
      <main style={{ padding: 40, fontFamily: "sans-serif" }}>
        <h2>Not found</h2>
        <a href="/">← Back</a>
      </main>
    );
  }

  const diff = data.new_price - data.old_price;
  const isUp = diff > 0;

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.company}>{data.company}</div>
        <div style={styles.product}>{data.product}</div>
        <div style={styles.priceBlock}>
          <span style={styles.old}>{data.old_price}円</span>
          <span style={styles.arrow}>→</span>
          <span style={styles.new}>{data.new_price}円</span>
        </div>
        <div style={isUp ? styles.badgeUp : styles.badgeDown}>
          {isUp ? "+" : ""}{diff}円
        </div>
      </section>

      <section style={styles.card}>
        <h3 style={styles.title}>Price Insight</h3>
        <p style={styles.text}>
          この商品は<b>{Math.abs(diff)}</b>円の
          <b>{isUp ? "値上げ" : "値下げ"}</b>が発生しました。
        </p>
        <div style={styles.meta}>
          <div>ID: {data.id}</div>
          <div>Slug: {data.slug}</div>
        </div>
      </section>

      <a href={`/company/${data.slug}`} style={styles.back}>
        ← {data.company}に戻る
      </a>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f6f7f9", fontFamily: "ui-sans-serif, system-ui", padding: 40, color: "#111" },
  hero: { maxWidth: 800, margin: "0 auto", background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #e5e7eb" },
  company: { fontSize: 22, fontWeight: 800 },
  product: { marginTop: 6, color: "#6b7280" },
  priceBlock: { marginTop: 20, fontSize: 26, fontWeight: 700 },
  old: { color: "#6b7280" },
  new: { fontWeight: 800 },
  arrow: { margin: "0 10px", color: "#9ca3af" },
  badgeUp: { marginTop: 16, display: "inline-block", padding: "6px 10px", background: "#fee2e2", color: "#b91c1c", borderRadius: 999, fontSize: 12, fontWeight: 700 },
  badgeDown: { marginTop: 16, display: "inline-block", padding: "6px 10px", background: "#dcfce7", color: "#166534", borderRadius: 999, fontSize: 12, fontWeight: 700 },
  card: { maxWidth: 800, margin: "20px auto", background: "#fff", padding: 24, borderRadius: 16, border: "1px solid #e5e7eb" },
  title: { fontSize: 14, color: "#6b7280", marginBottom: 10 },
  text: { fontSize: 16, lineHeight: 1.7 },
  meta: { marginTop: 20, fontSize: 12, color: "#9ca3af", display: "grid", gap: 6 },
  back: { display: "block", maxWidth: 800, margin: "30px auto 0", color: "#2563eb", textDecoration: "none", fontWeight: 600 },
};
