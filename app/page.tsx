"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { COMPANIES } from "@/lib/companies";
import { detectTag, TAG_COLORS } from "@/lib/tags";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
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
      const tag = detectTag(item.product);
      return { ...item, diff, percent, tag };
    });
  }, [data]);

  const filtered = enriched.filter((item) => {
    const matchSearch = (item.company + item.product).toLowerCase().includes(search.toLowerCase());
    const matchTag = selectedTag ? item.tag === selectedTag : true;
    return matchSearch && matchTag;
  });

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

  // タグ一覧
  const allTags = useMemo(() => {
    const map: Record<string, number> = {};
    enriched.forEach((d) => { map[d.tag] = (map[d.tag] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [enriched]);

  // 企業ごとの値上げ回数
  const companyCount = useMemo(() => {
    const map: Record<string, number> = {};
    enriched.forEach((d) => { map[d.company] = (map[d.company] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
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
      name, count: v.count, avg: v.count > 0 ? Math.round(v.totalDiff / v.count) : 0,
    }));
  }, [enriched]);

  // 生活影響度スコア
  const impactScore = useMemo(() => {
    if (!enriched.length) return 0;
    const foodItems = enriched.filter((d) =>
      ["ラーメン", "お菓子", "ファストフード", "飲料", "乳製品", "パン", "コンビニ"].includes(d.tag)
    );
    if (!foodItems.length) return 0;
    const avgPercent = foodItems.reduce((a, b) => a + b.percent, 0) / foodItems.length;
    return Math.min(Math.round(avgPercent * 10), 100);
  }, [enriched]);

  const impactLabel = impactScore < 20 ? "低い" : impactScore < 50 ? "やや高い" : "高い";
  const impactColor = impactScore < 20 ? "var(--down)" : impactScore < 50 ? "#f59e0b" : "var(--up)";

  // ティッカー用テキスト
  const tickerText = useMemo(() => {
    return enriched.slice(0, 15).map((d) =>
      `${d.company} ${d.product} ${d.old_price}円→${d.new_price}円(${d.diff > 0 ? "+" : ""}${d.percent.toFixed(1)}%)`
    ).join("　　　");
  }, [enriched]);

  return (
    <div>
      {/* ティッカー */}
      {enriched.length > 0 && (
        <div style={{
          background: "var(--text-primary)", color: "#fff", overflow: "hidden",
          whiteSpace: "nowrap", fontSize: 12, fontWeight: 600, padding: "6px 0",
        }}>
          <div style={{
            display: "inline-block", animation: "ticker 30s linear infinite",
            paddingLeft: "100%",
          }}>
            🔴 値上げ速報　　{tickerText}
          </div>
        </div>
      )}

      <div className="container">
        {/* ヘッダー */}
        <div style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          borderRadius: 20, padding: "32px 28px", marginBottom: 28,
          color: "#fff", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40, width: 200, height: 200,
            background: "radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{
              background: "#dc2626", padding: "4px 12px", borderRadius: 20,
              fontSize: 11, fontWeight: 800, letterSpacing: 1,
            }}>LIVE</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>
            値上げウォッチ
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
            価格変動をリアルタイムで追跡
          </p>
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

        {/* 速報カード（横スクロール） */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-label">最新の値上げ速報</div>
          <div style={{
            display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8,
            scrollbarWidth: "thin",
          }}>
            {enriched.slice(0, 10).map((item) => (
              <div key={item.id} onClick={() => router.push(`/company/${item.slug}`)} style={{
                minWidth: 220, background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: "14px 16px", cursor: "pointer",
                flexShrink: 0, transition: "box-shadow var(--transition)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.company}</div>
                  <span style={{
                    fontSize: 10, padding: "2px 6px", borderRadius: 8,
                    background: TAG_COLORS[item.tag] + "18", color: TAG_COLORS[item.tag],
                    fontWeight: 700,
                  }}>{item.tag}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{item.product}</div>
                <div style={{ marginTop: 10, fontSize: 14 }}>
                  <span style={{ color: "var(--text-muted)" }}>{item.old_price}円</span>
                  <span style={{ margin: "0 4px", color: "var(--text-muted)" }}>→</span>
                  <span style={{ fontWeight: 800 }}>{item.new_price}円</span>
                </div>
                <span className={item.diff > 0 ? "badge-up" : "badge-down"} style={{ marginTop: 8, display: "inline-block" }}>
                  {item.diff > 0 ? "+" : ""}{item.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2カラム: 生活影響度 + 企業値上げ回数 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
          {/* 生活影響度スコア */}
          <div className="card">
            <div className="section-label">生活影響度スコア</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                border: `4px solid ${impactColor}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column",
              }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: impactColor }}>{impactScore}</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: impactColor }}>{impactLabel}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
                  食品・日用品の平均値上げ率から<br />家計への影響度を算出
                </div>
              </div>
            </div>
          </div>

          {/* 企業値上げ回数 */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px 8px" }}>
              <div className="section-label">値上げ回数ランキング</div>
            </div>
            {companyCount.map(([name, count], i) => (
              <div key={name} style={{
                padding: "10px 20px", borderBottom: "1px solid var(--border-light)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: i === 0 ? "var(--accent)" : "var(--bg)",
                    color: i === 0 ? "#fff" : "var(--text-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: "2px 10px",
                  background: "var(--accent-light)", color: "var(--accent)", borderRadius: 20,
                }}>{count}回</span>
              </div>
            ))}
          </div>
        </div>

        {/* 業界別 */}
        <div className="card" style={{ marginBottom: 28 }}>
          <div className="section-label">業界別サマリー</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginTop: 12 }}>
            {categoryData.map((cat) => (
              <div key={cat.name} style={{
                background: "var(--bg)", borderRadius: "var(--radius)",
                padding: 16, border: "1px solid var(--border-light)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{cat.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>件数</div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{cat.count}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>平均</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: cat.avg > 0 ? "var(--up)" : "var(--down)" }}>
                      {cat.avg > 0 ? "+" : ""}¥{cat.avg}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bot状況 */}
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

        {/* タグフィルター */}
        <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setSelectedTag(null)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid var(--border)",
            background: selectedTag === null ? "var(--text-primary)" : "var(--surface)",
            color: selectedTag === null ? "#fff" : "var(--text-secondary)",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>すべて</button>
          {allTags.map(([tag, count]) => (
            <button key={tag} onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} style={{
              padding: "6px 14px", borderRadius: 20,
              border: `1px solid ${selectedTag === tag ? TAG_COLORS[tag] : "var(--border)"}`,
              background: selectedTag === tag ? TAG_COLORS[tag] + "15" : "var(--surface)",
              color: selectedTag === tag ? TAG_COLORS[tag] : "var(--text-secondary)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>{tag} ({count})</button>
          ))}
        </div>

        {/* 検索 */}
        <input
          placeholder="企業名・商品名で検索..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "12px 16px", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", fontSize: 14, marginBottom: 16,
            outline: "none", fontFamily: "var(--font)", background: "var(--surface)",
          }}
        />

        {/* 一覧 */}
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
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{item.company}</span>
                      <span style={{
                        fontSize: 10, padding: "2px 6px", borderRadius: 8,
                        background: TAG_COLORS[item.tag] + "18", color: TAG_COLORS[item.tag],
                        fontWeight: 700,
                      }}>{item.tag}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.product}</div>
                  </div>
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
    </div>
  );
}
