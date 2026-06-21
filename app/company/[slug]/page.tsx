"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import PriceChart from "@/components/PriceChart";

type PriceChange = {
  id: string;
  company: string;
  slug: string;
  product: string;
  old_price: number;
  new_price: number;
};

export default function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ ここが修正ポイント（Promiseをunwrap）
  const { slug } = React.use(params);

  const [data, setData] = useState<PriceChange[]>([]);

  // =====================
  // データ取得
  // =====================
  useEffect(() => {
const fetchData = async () => {
  console.log("slug:", slug); // ← 追加①

  const { data, error } = await supabase
    .from("price_changes")
    .select("*")
    .eq("slug", slug)
    .order("id", { ascending: false });

  console.log("data:", data);   // ← 追加②
  console.log("error:", error); // ← 追加③

  if (!error) setData((data as PriceChange[]) || []);
};

    fetchData();
  }, [slug]);

  // =====================
  // 正規化 + 分析
  // =====================
  const enriched = useMemo(() => {
    return data.map((item) => {
      const oldPrice = item.old_price ?? 0;
      const newPrice = item.new_price ?? 0;

      const diff = newPrice - oldPrice;
      const percent = oldPrice !== 0 ? (diff / oldPrice) * 100 : 0;

      return {
        ...item,
        old_price: oldPrice,
        new_price: newPrice,
        diff,
        percent,
      };
    });
  }, [data]);

  // =====================
  // KPI
  // =====================
  const kpi = useMemo(() => {
    if (!enriched.length) return null;

    const diffs = enriched.map((d) => d.diff);

    const avgChange =
      diffs.reduce((a, b) => a + b, 0) / diffs.length;

    return {
      avgChange,
      maxUp: Math.max(...diffs),
      maxDown: Math.min(...diffs),
      count: enriched.length,
    };
  }, [enriched]);

  // =====================
  // チャート
  // =====================
  const chartData = useMemo(() => {
    return enriched.map((item) => ({
      company: item.company,
      oldPrice: item.old_price,
      newPrice: item.new_price,
    }));
  }, [enriched]);

  // =====================
  // インサイト
  // =====================
  const insight = useMemo(() => {
    if (!kpi) return "";

    if (kpi.avgChange > 0)
      return "この企業は全体的に価格上昇トレンドにあります。";

    if (kpi.avgChange < 0)
      return "この企業は価格下落傾向が見られます。";

    return "価格は安定しています。";
  }, [kpi]);

  if (!enriched.length) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>{enriched[0]?.company}</h1>
          <p style={styles.subText}>{insight}</p>
        </div>

        {/* KPI */}
        <div style={styles.kpiRow}>
          <div style={styles.card}>
            <div style={styles.label}>平均変動</div>
            <b>{kpi?.avgChange?.toFixed(2) ?? 0}</b>
          </div>

          <div style={styles.card}>
            <div style={styles.label}>最大上昇</div>
            <b style={{ color: "#e11d48" }}>{kpi?.maxUp}</b>
          </div>

          <div style={styles.card}>
            <div style={styles.label}>最大下落</div>
            <b style={{ color: "#16a34a" }}>{kpi?.maxDown}</b>
          </div>

          <div style={styles.card}>
            <div style={styles.label}>データ数</div>
            <b>{kpi?.count}</b>
          </div>
        </div>

        {/* CHART */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Price Trend</div>
          <div style={styles.chartBox}>
            <PriceChart data={chartData} />
          </div>
        </div>

        {/* LIST */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>History</div>

          <div style={styles.list}>
            {enriched.map((item) => (
              <div key={item.id} style={styles.row}>
                <div>
                  <div style={styles.product}>{item.product}</div>
                  <div style={styles.company}>{item.company}</div>
                </div>

                <div style={styles.priceBox}>
                  {item.old_price} → <b>{item.new_price}</b>

                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      color: item.diff > 0 ? "#e11d48" : "#16a34a",
                    }}
                  >
                    {item.diff > 0 ? "+" : ""}
                    {(item.percent ?? 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================
   STYLE
===================== */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 40,
    fontFamily: "system-ui",
    background: "#f6f7f9",
    minHeight: "100vh",
  },
  loading: { padding: 40 },
  container: {
    maxWidth: 900,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 800 },
  subText: { marginTop: 8, color: "#666" },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    padding: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
  },
  label: { fontSize: 12, color: "#666", marginBottom: 4 },
  section: { marginTop: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    color: "#555",
  },
  chartBox: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
  },
  list: {
    borderTop: "1px solid #eee",
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    padding: 12,
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  product: { fontWeight: 600 },
  company: { fontSize: 12, color: "#888" },
  priceBox: { textAlign: "right" },
};