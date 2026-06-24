"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type PriceChange = {
  id: string;
  company: string;
  slug: string;
  product: string;
  old_price: number;
  new_price: number;
  change_type?: string;
  source_url?: string;
  article_text?: string;
  article_date?: string;
  change_date?: string;
  amount?: string;
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
}

function displayDate(item: PriceChange): string {
  return formatDate(item.change_date);
}

export default function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  const [data, setData] = useState<PriceChange[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("price_changes").select("*").eq("slug", slug).order("id", { ascending: false });
      if (!error) setData((data as PriceChange[]) || []);
    };
    fetchData();
  }, [slug]);

  const enriched = useMemo(() => {
    return data.map((item) => {
      const diff = item.new_price - item.old_price;
      const percent = item.old_price !== 0 ? (diff / item.old_price) * 100 : 0;
      return { ...item, diff, percent };
    });
  }, [data]);

  const kpi = useMemo(() => {
    if (!enriched.length) return null;
    const diffs = enriched.map((d) => d.diff);
    return {
      avg: diffs.reduce((a, b) => a + b, 0) / diffs.length,
      maxUp: Math.max(...diffs),
      maxDown: Math.min(...diffs),
      count: enriched.length,
    };
  }, [enriched]);

  const chartData = useMemo(() => {
    return enriched.map((item) => ({
      product: item.product.slice(0, 8),
      旧価格: item.old_price,
      新価格: item.new_price,
    }));
  }, [enriched]);

  const insight = useMemo(() => {
    if (!kpi) return "";
    if (kpi.avg > 0) return "全体的に価格上昇トレンドにあります";
    if (kpi.avg < 0) return "価格下落傾向が見られます";
    return "価格は安定しています";
  }, [kpi]);

  if (!enriched.length) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 14, color: "var(--text-muted)" }}>データがありません</div>
          <a href="/company" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, marginTop: 12, display: "inline-block" }}>← 企業一覧に戻る</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: 28 }}>
        <a href="/company" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>← 企業一覧</a>
        <h1 className="page-title" style={{ marginTop: 8 }}>{enriched[0]?.company}</h1>
        <p className="page-sub">{insight}</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">平均変動</div>
          <div className="kpi-value">¥{kpi?.avg?.toFixed(0) ?? 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">最大上昇</div>
          <div className="kpi-value" style={{ color: "var(--up)" }}>¥{kpi?.maxUp}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">最大下落</div>
          <div className="kpi-value" style={{ color: "var(--down)" }}>¥{kpi?.maxDown}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">データ数</div>
          <div className="kpi-value">{kpi?.count}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 28 }}>
        <div className="section-label">価格比較</div>
        <div style={{ marginTop: 12 }}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="product" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="旧価格" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
              <Bar dataKey="新価格" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px 8px" }}>
          <div className="section-label">価格変動履歴</div>
        </div>
        {enriched.map((item) => {
          const dateLabel = displayDate(item);
          return (
            <div key={item.id} className="list-row" onClick={() => router.push(`/detail/${item.id}`)}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {item.product}
                  {item.amount && <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}> ({item.amount})</span>}
                </div>
                {dateLabel && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    📅 {dateLabel}
                  </div>
                )}
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
          );
        })}
      </div>
    </div>
  );
}
