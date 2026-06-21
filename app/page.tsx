"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import PriceChart from "@/components/PriceChart";
import { motion } from "framer-motion";
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
  const [dark, setDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("price_changes")
        .select("*");

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setData(data || []);
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel("price_changes_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "price_changes" },
        fetchData
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // =====================
  // フィルター
  // =====================
  const filtered = data.filter((item) =>
    (item.company + item.product)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // =====================
  // 分析レイヤー
  // =====================
  const enriched = useMemo(() => {
    return filtered.map((item) => {
      const diff = item.new_price - item.old_price;
      const percent =
        item.old_price !== 0
          ? (diff / item.old_price) * 100
          : 0;

      return { ...item, diff, percent };
    });
  }, [filtered]);

  // =====================
  // KPI（SaaSの核）
  // =====================
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

  // =====================
  // トレンド（重要度順）
  // =====================
  const trending = [...enriched]
    .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))
    .slice(0, 6);

  const chartData = enriched.map((item) => ({
    company: item.company,
    oldPrice: item.old_price,
    newPrice: item.new_price,
  }));

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        ...styles.page,
        background: dark ? "#0a0a0a" : "#f6f7f9",
        color: dark ? "#fff" : "#111",
      }}
    >
      {/* HEADER */}
      <div style={styles.hero}>
        <div style={styles.topbar}>
          <div style={styles.logo}>▲ PriceWatch</div>

          <button onClick={() => setDark(!dark)} style={styles.toggle}>
            {dark ? "Dark" : "Light"}
          </button>
        </div>

        <h1 style={styles.h1}>Real-time Price Intelligence</h1>
        <p style={styles.subText}>
          日本の価格変動をリアルタイムで可視化
        </p>

        {/* KPI */}
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div>Events</div>
            <b>{data.length}</b>
          </div>

          <div style={styles.kpiCard}>
            <div>Companies</div>
            <b>{new Set(data.map((d) => d.company)).size}</b>
          </div>

          <div style={styles.kpiCard}>
            <div>Avg Change</div>
            <b>{kpi?.avg.toFixed(2) ?? 0}</b>
          </div>

          <div style={styles.kpiCard}>
            <div>Trend</div>
            <b>Live</b>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={styles.container}>
        {/* LEFT */}
        <div>
          <input
            style={styles.search}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div style={styles.panel}>
            <div style={styles.panelTitle}>Price Trend</div>
            <PriceChart data={chartData} />
          </div>

          <div style={styles.list}>
            {loading ? (
              <p>Loading...</p>
            ) : (
              enriched.map((item) => (
                <div
                  key={item.id}
                  style={styles.row}
                  onClick={() => router.push(`/company/${item.slug}`)}
                >
                  <div>
                    <b>{item.company}</b>
                    <div style={styles.small}>{item.product}</div>
                  </div>

                  <div style={styles.price}>
                    {item.old_price} → {item.new_price}
                    <span
                      style={{
                        marginLeft: 8,
                        color: item.diff > 0 ? "red" : "green",
                      }}
                    >
                      {item.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.side}>
          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>Trending</div>

            {trending.map((item) => (
              <div key={item.id} style={styles.trendItem}>
                <b>{item.company}</b>
                <div style={styles.small}>
                  {item.old_price} → {item.new_price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.main>
  );
}

/* ===================== */
const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", fontFamily: "system-ui" },

  hero: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 40,
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
  },

  logo: { fontWeight: 800 },

  toggle: {
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: 8,
  },

  h1: { fontSize: 40, fontWeight: 800, marginTop: 20 },

  subText: { color: "#666" },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 12,
    marginTop: 20,
  },

  kpiCard: {
    background: "#fff",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #eee",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 20,
    padding: 40,
  },

  search: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    border: "1px solid #ddd",
    borderRadius: 10,
  },

  panel: {
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  panelTitle: { fontSize: 12, color: "#666" },

  list: {
    background: "#fff",
    borderRadius: 12,
  },

  row: {
    padding: 14,
    borderBottom: "1px solid #eee",
    cursor: "pointer",
  },

  price: { marginTop: 6 },

  small: { fontSize: 12, color: "#888" },

  side: {},

  sideCard: {
    background: "#fff",
    padding: 16,
    borderRadius: 12,
  },

  sideTitle: { fontSize: 12, color: "#666" },

  trendItem: {
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
};