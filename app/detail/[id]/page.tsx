import { createClient } from "@supabase/supabase-js";
import ShareButtons from "@/components/ShareButtons";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabase.from("price_changes").select("*").eq("id", id).single();

  if (!data) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>データが見つかりません</h2>
          <a href="/" style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>← ダッシュボードに戻る</a>
        </div>
      </div>
    );
  }

  const diff = data.new_price - data.old_price;
  const isUp = diff > 0;
  const percent = data.old_price !== 0 ? (diff / data.old_price) * 100 : 0;

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <a href={`/company/${data.slug}`} style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>
        ← {data.company}
      </a>

      <div className="card" style={{ marginTop: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>{data.company}</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>{data.product}</h1>

        <div style={{ marginTop: 24, display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 18, color: "var(--text-muted)" }}>{data.old_price}円</span>
          <span style={{ color: "var(--text-muted)" }}>→</span>
          <span style={{ fontSize: 28, fontWeight: 900 }}>{data.new_price}円</span>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <span className={isUp ? "badge-up" : "badge-down"} style={{ fontSize: 14, padding: "4px 12px" }}>
            {isUp ? "+" : ""}{diff}円
          </span>
          <span className={isUp ? "badge-up" : "badge-down"} style={{ fontSize: 14, padding: "4px 12px" }}>
            {isUp ? "+" : ""}{percent.toFixed(1)}%
          </span>
        </div>

        <ShareButtons
          company={data.company}
          product={data.product}
          oldPrice={data.old_price}
          newPrice={data.new_price}
          percent={percent}
        />
      </div>

      <div className="card">
        <div className="section-label">詳細情報</div>
        <div style={{ marginTop: 12, display: "grid", gap: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "10px 0", borderBottom: "1px solid var(--border-light)" }}>
            <span style={{ color: "var(--text-muted)" }}>変動タイプ</span>
            <span style={{ fontWeight: 600 }}>{isUp ? "値上げ" : "値下げ"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "10px 0", borderBottom: "1px solid var(--border-light)" }}>
            <span style={{ color: "var(--text-muted)" }}>企業</span>
            <span style={{ fontWeight: 600 }}>{data.company}</span>
          </div>
          {data.change_date && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "10px 0", borderBottom: "1px solid var(--border-light)" }}>
              <span style={{ color: "var(--text-muted)" }}>値上げ日</span>
              <span style={{ fontWeight: 600 }}>📅 {data.change_date}</span>
            </div>
          )}
          {data.article_date && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "10px 0", borderBottom: "1px solid var(--border-light)" }}>
              <span style={{ color: "var(--text-muted)" }}>記事公開日</span>
              <span style={{ fontWeight: 600 }}>{data.article_date}</span>
            </div>
          )}
          {data.source_url && data.source_url !== "manual" && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "10px 0" }}>
              <span style={{ color: "var(--text-muted)" }}>ソース</span>
              <a href={data.source_url} target="_blank" style={{ color: "var(--accent)", fontWeight: 600 }}>記事を見る →</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
