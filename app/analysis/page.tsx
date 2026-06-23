"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { COMPANIES } from "@/lib/companies";
import { detectTag, TAG_COLORS } from "@/lib/tags";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

type PriceChange = {
  id: string;
  company: string;
  slug: string;
  product: string;
  old_price: number;
  new_price: number;
  change_type?: string;
  article_date?: string;
  change_date?: string;
};

type Enriched = PriceChange & { diff: number; percent: number; tag: string; month: string };

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

const PIE_COLORS = ["#4f46e5", "#dc2626", "#16a34a", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#6366f1", "#d97706"];

export default function AnalysisPage() {
  const [data, setData] = useState<PriceChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase.from("price_changes").select("*").order("id", { ascending: false });
      setData(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const enriched: Enriched[] = useMemo(() => {
    return data.map((item) => {
      const diff = item.new_price - item.old_price;
      const percent = item.old_price !== 0 ? (diff / item.old_price) * 100 : 0;
      const tag = detectTag(item.product);
      const dateStr = item.change_date || item.article_date || "";
      const month = dateStr ? formatDate(dateStr) : "不明";
      return { ...item, diff, percent, tag, month };
    });
  }, [data]);

  // --- 集計データ ---

  // 企業別 平均値上げ率ランキング
  const companyAvg = useMemo(() => {
    const map: Record<string, { total: number; count: number; name: string }> = {};
    enriched.forEach((d) => {
      if (!map[d.slug]) map[d.slug] = { total: 0, count: 0, name: d.company };
      map[d.slug].total += d.percent;
      map[d.slug].count += 1;
    });
    return Object.entries(map)
      .map(([slug, v]) => ({ slug, name: v.name, avg: Math.round((v.total / v.count) * 10) / 10, count: v.count }))
      .filter((d) => d.count >= 1)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);
  }, [enriched]);

  // カテゴリ別 件数・平均
  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; totalDiff: number; totalPercent: number }> = {};
    enriched.forEach((item) => {
      const company = Object.values(COMPANIES).find((c) => c.slug === item.slug);
      const cat = company?.category || "その他";
      if (!map[cat]) map[cat] = { count: 0, totalDiff: 0, totalPercent: 0 };
      map[cat].count += 1;
      map[cat].totalDiff += item.diff;
      map[cat].totalPercent += item.percent;
    });
    return Object.entries(map)
      .map(([name, v]) => ({
        name,
        count: v.count,
        avgDiff: Math.round(v.totalDiff / v.count),
        avgPercent: Math.round((v.totalPercent / v.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  }, [enriched]);

  // タグ別分布（PieChart用）
  const tagDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    enriched.forEach((d) => { map[d.tag] = (map[d.tag] || 0) + 1; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [enriched]);

  // 月別推移
  const monthlyTrend = useMemo(() => {
    const map: Record<string, { count: number; totalDiff: number; ups: number; downs: number }> = {};
    enriched.forEach((d) => {
      if (d.month === "不明") return;
      if (!map[d.month]) map[d.month] = { count: 0, totalDiff: 0, ups: 0, downs: 0 };
      map[d.month].count += 1;
      map[d.month].totalDiff += d.diff;
      if (d.diff > 0) map[d.month].ups += 1;
      else map[d.month].downs += 1;
    });
    return Object.entries(map)
      .map(([month, v]) => ({
        month,
        件数: v.count,
        値上げ: v.ups,
        値下げ: v.downs,
        平均変動: Math.round(v.totalDiff / v.count),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [enriched]);

  // 値上げ幅TOP10
  const topIncreases = useMemo(() => {
    return [...enriched]
      .sort((a, b) => b.diff - a.diff)
      .slice(0, 10);
  }, [enriched]);

  // 値上げ率TOP10
  const topPercentIncreases = useMemo(() => {
    return [...enriched]
      .filter((d) => d.percent > 0)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 10);
  }, [enriched]);

  // 全体統計
  const stats = useMemo(() => {
    if (!enriched.length) return null;
    const diffs = enriched.map((d) => d.diff);
    const percents = enriched.map((d) => d.percent);
    const ups = enriched.filter((d) => d.diff > 0);
    const downs = enriched.filter((d) => d.diff < 0);
    return {
      total: enriched.length,
      companies: new Set(enriched.map((d) => d.company)).size,
      avgDiff: Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length),
      avgPercent: Math.round((percents.reduce((a, b) => a + b, 0) / percents.length) * 10) / 10,
      maxDiff: Math.max(...diffs),
      minDiff: Math.min(...diffs),
      upCount: ups.length,
      downCount: downs.length,
      upRatio: Math.round((ups.length / enriched.length) * 100),
    };
  }, [enriched]);

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 14, color: "var(--text-muted)" }}>データを読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 14, color: "var(--text-muted)" }}>データがありません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">データ分析</h1>
      <p className="page-sub">収集データの統計・トレンド分析</p>

      {/* 全体統計 KPI */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
        <div className="kpi-card">
          <div className="kpi-label">総データ数</div>
          <div className="kpi-value">{stats.total}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">企業数</div>
          <div className="kpi-value">{stats.companies}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">平均変動額</div>
          <div className="kpi-value" style={{ color: stats.avgDiff > 0 ? "var(--up)" : "var(--down)" }}>
            {stats.avgDiff > 0 ? "+" : ""}¥{stats.avgDiff}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">平均変動率</div>
          <div className="kpi-value" style={{ color: stats.avgPercent > 0 ? "var(--up)" : "var(--down)" }}>
            {stats.avgPercent > 0 ? "+" : ""}{stats.avgPercent}%
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">値上げ件数</div>
          <div className="kpi-value" style={{ color: "var(--up)" }}>{stats.upCount}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">値下げ件数</div>
          <div className="kpi-value" style={{ color: "var(--down)" }}>{stats.downCount}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">値上げ率</div>
          <div className="kpi-value">{stats.upRatio}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">最大値上げ</div>
          <div className="kpi-value" style={{ color: "var(--up)" }}>¥{stats.maxDiff}</div>
        </div>
      </div>

      {/* 月別推移チャート */}
      {monthlyTrend.length > 0 && (
        <div className="card" style={{ marginBottom: 28 }}>
          <div className="section-label">月別推移</div>
          <div style={{ marginTop: 12 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="値上げ" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="値下げ" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2カラム: タグ分布 + カテゴリ別 */}
      <div className="analysis-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {/* タグ別分布 */}
        <div className="card">
          <div className="section-label">商品カテゴリ分布</div>
          <div style={{ marginTop: 12 }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={tagDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  fontSize={11}
                >
                  {tagDistribution.map((entry, i) => (
                    <Cell key={entry.name} fill={TAG_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 業界別統計 */}
        <div className="card">
          <div className="section-label">業界別統計</div>
          <div style={{ marginTop: 12 }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryStats} layout="vertical">
                <XAxis type="number" fontSize={11} />
                <YAxis dataKey="name" type="category" fontSize={11} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} name="件数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 企業別 平均値上げ率 */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="section-label">企業別 平均値上げ率ランキング</div>
        <div style={{ marginTop: 12 }}>
          <ResponsiveContainer width="100%" height={Math.max(200, companyAvg.length * 36)}>
            <BarChart data={companyAvg} layout="vertical">
              <XAxis type="number" fontSize={11} unit="%" />
              <YAxis dataKey="name" type="category" fontSize={11} width={100} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="avg" fill="#dc2626" radius={[0, 4, 4, 0]} name="平均値上げ率" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2カラム: 値上げ額TOP10 + 値上げ率TOP10 */}
      <div className="analysis-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <div className="section-label">値上げ額 TOP10</div>
          </div>
          {topIncreases.map((item, i) => (
            <div key={item.id} style={{
              padding: "10px 20px", borderBottom: "1px solid var(--border-light)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: i < 3 ? "var(--up)" : "var(--bg)",
                  color: i < 3 ? "#fff" : "var(--text-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800,
                }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.company}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.product}</div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--up)" }}>+¥{item.diff}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <div className="section-label">値上げ率 TOP10</div>
          </div>
          {topPercentIncreases.map((item, i) => (
            <div key={item.id} style={{
              padding: "10px 20px", borderBottom: "1px solid var(--border-light)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: i < 3 ? "var(--up)" : "var(--bg)",
                  color: i < 3 ? "#fff" : "var(--text-secondary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800,
                }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.company}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.product}</div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--up)" }}>+{item.percent.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 業界別詳細テーブル */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="section-label">業界別詳細</div>
        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--text-muted)", fontWeight: 600, fontSize: 11 }}>業界</th>
                <th style={{ textAlign: "right", padding: "8px 12px", color: "var(--text-muted)", fontWeight: 600, fontSize: 11 }}>件数</th>
                <th style={{ textAlign: "right", padding: "8px 12px", color: "var(--text-muted)", fontWeight: 600, fontSize: 11 }}>平均変動額</th>
                <th style={{ textAlign: "right", padding: "8px 12px", color: "var(--text-muted)", fontWeight: 600, fontSize: 11 }}>平均変動率</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((cat) => (
                <tr key={cat.name} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>{cat.count}件</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: cat.avgDiff > 0 ? "var(--up)" : "var(--down)", fontWeight: 700 }}>
                    {cat.avgDiff > 0 ? "+" : ""}¥{cat.avgDiff}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: cat.avgPercent > 0 ? "var(--up)" : "var(--down)", fontWeight: 700 }}>
                    {cat.avgPercent > 0 ? "+" : ""}{cat.avgPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
