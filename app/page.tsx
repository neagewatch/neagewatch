"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { COMPANIES } from "@/lib/companies";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

type PriceChange = {
  id: string;
  company: string;
  slug: string;
  product: string;
  old_price: number;
  new_price: number;
  created_at?: string;
};

export default function Home() {
  const [data, setData] = useState<PriceChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase.from("price_changes").select("*").order("id", { ascending: false });
      setData(data || []);
      setLoading(false);
    };
    fetchData();
    const channel = supabase
      .channel("realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "price_changes" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const enriched = useMemo(() => {
    return data.map((item) => {
      const diff = item.new_price - item.old_price;
      const percent = item.old_price !== 0 ? (diff / item.old_price) * 100 : 0;
      return { ...item, diff, percent };
    });
  }, [data]);

  const filtered = enriched.filter((item) =>
    (item.company + item.product).toLowerCase().includes(search.toLowerCase())
  );

  // KPI
  const kpi = useMemo(() => {
    if (!enriched.length) return { total: 0, companies: 0, avg: 0, maxUp: 0 };
    const diffs = enriched.map((d) => d.diff);
    return {
      total: enriched.length,
      companies: new Set(enriched.map((d) => d.company)).size,
      avg: diffs.reduce((a, b) => a + b, 0) / diffs.length,
      maxUp: Math.max(...diffs),
    };
  }, [enriched]);

  // 値上げ率ランキング
  const ranking = useMemo(() => {
    return [...enriched].sort((a, b) => b.percent - a.percent).slice(0, 5);
  }, [enriched]);

  // 業界別集計
  const categoryData = useMemo(() => {
    const map: Record<string, { count: number; totalDiff: number }> = {};
    enriched.forEach((item) => {
      const company = Object.values(COMPANIES).find((c) => c.slug === item.slug);
      const cat = company?.category || "その他";
      if (!map[cat]) map[cat] = { count: 0, totalDiff: 0 };
      map[cat].count += 1;
      map[cat].totalDiff += item.diff;
    });
    return Object.entries(map).map(([name, v]) => ({
      name,
      count: v.count,
      avg: v.count > 0 ? Math.round(v.totalDiff / v.count) : 0,
    }));
  }, [enriched]);

  // 値上げ vs 値下げ
  const upDown = useMemo(() => {
    const up = enriched.filter((d) => d.diff > 0).length;
    const down = enriched.filter((d) => d.diff < 0).length;
    const same = enriched.filter((d) => d.diff === 0).length;
    return [
      { name: "値上げ", value: up },
      { name: "値下げ", value: down },
      { name: "変動なし", value: same },
    ];
  }, [enriched]);

  const PIE_COLORS = ["#dc2626", "#16a34a", "#9ca3af"];

  return (
    <div className="container">

      {/* 値上げ速報 */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        borderRadius: 20,
        padding: "32px 28px",
        marginBottom: 28,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200,
          background: "radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{
            background: "#dc2626", padding: "4px 12px", borderRadius: 20,
            fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase",
          }}>速報</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>リアルタイム更新</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>
          値上げウォッチ
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
          日本の価格変動をリアルタイムで追跡
        </p>
        {enriched.length > 0 ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {enriched.slice(0, 3).map((item) => (
              <div key={item.id} style={{
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, padding: "12px 16px",
                cursor: "pointer", flex: "1 1 200px",
                transition: "background 0.15s",
              }}
                onClick={() => router.push(`/company/${item.slug}`)}
              >
                <div style={{ fontSize: 13, fontWeight: 700 }}>{item.company}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{item.product}</div>
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{item.old_price}円</span>
                  <span style={{ margin: "0 6px", color: "rgba(255,255,255,0.3)" }}>→</span>
                  <span style={{ fontWeight: 800 }}>{item.new_price}円</span>
                  <span style={{
                    marginLeft: 8, fontSize: 12, fontWeight: 700,
                    color: item.diff > 0 ? "#f87171" : "#4ade80",
                  }}>
                    {item.diff > 0 ? "+" : ""}{item.percent.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "rgba(255,255,255,0.4)" }}>データ待機中...</div>
        )}
      </div>

      {/* KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">データ数</div>
          <div className="kpi-value">{kpi.total}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">企業数</div>
          <div className="kpi-value">{kpi.companies}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">平均変動</div>
          <div className="kpi-value">¥{kpi.avg.toFixed(0)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">最大値上げ</div>
          <div className="kpi-value" style={{ color: "var(--up)" }}>¥{kpi.maxUp}</div>
        </div>
      </div>

      {/* 2カラム: ランキング + 値上げ比率 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* 値上げ率ランキング */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <div className="section-label">値上げ率ランキング</div>
          </div>
          {ranking.length > 0 ? (
            <div style={{ padding: "0 20px 16px" }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ranking} layout="vertical" margin={{ left: 60 }}>
                  <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} fontSize={11} />
                  <YAxis type="category" dataKey="company" fontSize={12} width={60} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                  <Bar dataKey="percent" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: 20, color: "var(--text-muted)" }}>データなし</div>
          )}
        </div>

        {/* 値上げ vs 値下げ */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <div className="section-label">値上げ vs 値下げ</div>
          </div>
          {enriched.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", padding: "0 20px 16px" }}>
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={upDown} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {upDown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {upDown.map((item, i) => (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_COLORS[i] }} />
                    <span style={{ fontSize: 13 }}>{item.name}</span>
                    <span style={{ fontWeight: 700, marginLeft: "auto" }}>{item.value}件</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 20, color: "var(--text-muted)" }}>データなし</div>
          )}
        </div>
      </div>

      {/* 業界別ヒートマップ */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="section-label">業界別サマリー</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginTop: 12 }}>
          {categoryData.map((cat) => (
            <div key={cat.name} style={{
              background: "var(--bg)",
              borderRadius: "var(--radius)",
              padding: "16px",
              border: "1px solid var(--border-light)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{cat.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>件数</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{cat.count}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>平均変動</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: cat.avg > 0 ? "var(--up)" : "var(--down)" }}>
                    {cat.avg > 0 ? "+" : ""}¥{cat.avg}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RSS取得状況 */}
      <div className="card" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="section-label">Bot稼働状況</div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>1時間ごとにRSSを自動取得</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--down)" }}>稼働中</span>
        </div>
      </div>

      {/* 検索 + 一覧 */}
      <input
        placeholder="企業名・商品名で検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%", padding: "12px 16px",
          border: "1px solid var(--border)", borderRadius: "var(--radius)",
          fontSize: 14, marginBottom: 16, outline: "none", fontFamily: "var(--font)",
          background: "var(--surface)",
        }}
      />

      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 28 }}>
        <div style={{ padding: "16px 20px 8px" }}>
          <div className="section-label">全データ一覧</div>
        </div>
        {loading ? (
          <div style={{ padding: 20, color: "var(--text-muted)" }}>読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 20, color: "var(--text-muted)" }}>データがありません</div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="list-row" onClick={() => router.push(`/company/${item.slug}`)}>
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
  );
}
