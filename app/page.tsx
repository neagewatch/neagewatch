"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import PriceChart from "@/components/PriceChart";
import { useRouter } from "next/navigation";

type PriceChange = {
  id: string;
  company: string;
  slug: string;
  product: string;
  old_price: number;
  new_price: number;
};

export default function Home() {
  const [data, setData] = useState<PriceChange[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("price_changes").select("*");
      if (!error) setData(data || []);
      setLoading(false);
    };
    fetchData();

    const channel = supabase
      .channel("price_changes_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "price_changes" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = data.filter((item) =>
    (item.company + item.product).toLowerCase().includes(search.toLowerCase())
  );

  const enriched = useMemo(() => {
    return filtered.map((item) => {
      const diff = item.new_price - item.old_price;
      const percent = item.old_price !== 0 ? (diff / item.old_price) * 100 : 0;
      return { ...item, diff, percent };
    });
  }, [filtered]);

  const kpi = useMemo(() => {
    if (!enriched.length) return null;
    const diffs = enriched.map((d) => d.diff);
    return {
      avg: diffs.reduce((a, b) => a + b, 0) / diffs.length,
      maxUp: Math.max(...diffs),
      maxDown: Math.min(...diffs),
      total: enriched.length,
    };
  }, [enriched]);

  const trending = [...enriched]
    .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))
    .slice(0, 5);

  const chartData = enriched.map((item) => ({
    company: item.company,
    oldPrice: item.old_price,
    newPrice: item.new_price,
  }));

  return (
    <div className="container">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">価格変動ダッシュボード</h1>
        <p className="page-sub">日本の価格変動をリアルタイムで可視化</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">データ数</div>
          <div className="kpi-value">{data.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">企業数</div>
          <div className="kpi-value">{new Set(data.map((d) => d.company)).size}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">平均変動</div>
          <div className="kpi-value">{kpi ? `¥${kpi.avg.toFixed(0)}` : "—"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">ステータス</div>
          <div className="kpi-value" style={{ color: "var(--accent)" }}>Live</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div>
          <input
            placeholder="企業名・商品名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              fontSize: 14,
              marginBottom: 16,
              outline: "none",
              fontFamily: "var(--font)",
            }}
          />

          <div className="card" style={{ marginBottom: 20, padding: 16 }}>
            <div className="section-label">価格トレンド</div>
            <PriceChart data={chartData} />
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 16px 8px" }}>
              <div className="section-label">価格変動一覧</div>
            </div>
            {loading ? (
              <div style={{ padding: 20, color: "var(--text-muted)" }}>読み込み中...</div>
            ) : enriched.length === 0 ? (
              <div style={{ padding: 20, color: "var(--text-muted)" }}>データがありません</div>
            ) : (
              enriched.map((item) => (
                <div
                  key={item.id}
                  className="list-row"
                  onClick={() => router.push(`/company/${item.slug}`)}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.company}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.product}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14 }}>
                      <span style={{ color: "var(--text-muted)" }}>{item.old_price}円</span>
                      <span style={{ margin: "0 6px", color: "var(--text-muted)" }}>→</span>
                      <span style={{ fontWeight: 700 }}>{item.new_price}円</span>
                    </div>
                    <span className={item.diff > 0 ? "badge-up" : "badge-down"}>
                      {item.diff > 0 ? "+" : ""}{item.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 16px 8px" }}>
              <div className="section-label">トレンド</div>
            </div>
            {trending.map((item) => (
              <div
                key={item.id}
                className="list-row"
                onClick={() => router.push(`/company/${item.slug}`)}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.company}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {item.old_price} → {item.new_price}
                  </div>
                </div>
                <span className={item.diff > 0 ? "badge-up" : "badge-down"}>
                  {item.diff > 0 ? "+" : ""}{item.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
