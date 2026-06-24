"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { COMPANIES } from "@/lib/companies";
import { detectTag, TAG_COLORS } from "@/lib/tags";
import { useRouter } from "next/navigation";

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

type BotRun = {
  id: string;
  ran_at: string;
  status: string;
  items_found: number;
  items_inserted: number;
  message?: string;
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "不明";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "不明";
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  return `${day}日前`;
}

// 実施日のみ表示。情報がなければ空文字（今日で埋めない）
function displayDate(item: PriceChange): string {
  return formatDate(item.change_date);
}

export default function Home() {
  const [data, setData] = useState<PriceChange[]>([]);
  const [botRuns, setBotRuns] = useState<BotRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"new" | "percent" | "diff">("new");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase.from("price_changes").select("*").order("id", { ascending: false });
      setData(data || []);
      // Bot稼働ログ（テーブルが無い場合は無視）
      const { data: runs } = await supabase.from("bot_runs").select("*").order("ran_at", { ascending: false }).limit(10);
      if (runs) setBotRuns(runs);
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

  const filtered = useMemo(() => {
    const result = enriched.filter((item) => {
      const matchSearch = (item.company + item.product).toLowerCase().includes(search.toLowerCase());
      const matchTag = selectedTag ? item.tag === selectedTag : true;
      return matchSearch && matchTag;
    });
    if (sortBy === "percent") result.sort((a, b) => b.percent - a.percent);
    else if (sortBy === "diff") result.sort((a, b) => b.diff - a.diff);
    return result;
  }, [enriched, search, selectedTag, sortBy]);

  const kpi = useMemo(() => {
    if (!enriched.length) return { total: 0, companies: 0, ups: 0, downs: 0 };
    return {
      total: enriched.length,
      companies: new Set(enriched.map((d) => d.company)).size,
      ups: enriched.filter((d) => d.diff > 0).length,
      downs: enriched.filter((d) => d.diff < 0).length,
    };
  }, [enriched]);

  const allTags = useMemo(() => {
    const map: Record<string, number> = {};
    enriched.forEach((d) => { map[d.tag] = (map[d.tag] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [enriched]);

  // エンゲージメント: 今日/今週/今後の値上げ
  const engagement = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekLater = new Date(today); weekLater.setDate(weekLater.getDate() + 7);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

    let todayCount = 0, thisWeekCount = 0, upcomingCount = 0;
    enriched.forEach((d) => {
      if (!d.change_date) return;
      const cd = new Date(d.change_date); cd.setHours(0, 0, 0, 0);
      if (isNaN(cd.getTime())) return;
      if (cd.getTime() === today.getTime()) todayCount++;
      if (cd >= weekAgo && cd <= today) thisWeekCount++;
      if (cd > today && cd <= weekLater) upcomingCount++;
    });
    return { todayCount, thisWeekCount, upcomingCount };
  }, [enriched]);

  // 共有したくなる: 衝撃の値上げ率TOP3
  const shockRanking = useMemo(() => {
    return [...enriched]
      .filter((d) => d.percent > 0)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3);
  }, [enriched]);

  const lastRun = botRuns[0];
  const botHealthy = useMemo(() => {
    if (!lastRun) return null;
    const diff = Date.now() - new Date(lastRun.ran_at).getTime();
    return diff < 2 * 3600 * 1000; // 2時間以内なら正常
  }, [lastRun]);

  return (
    <div>
      <div className="container">
        {/* ヘッダー */}
        <div className="hero">
          <div className="hero-glow" />
          <div className="hero-badge">
            <span className="hero-dot" />
            LIVE TRACKING
          </div>
          <h1 className="hero-title">値上げウォッチ</h1>
          <p className="hero-sub">日本中の価格変動を、リアルタイムで。</p>
        </div>

        {/* Bot稼働ステータス（実データ） */}
        <div className="bot-status">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className={`bot-indicator ${botHealthy === false ? "warn" : botHealthy === null ? "unknown" : ""}`} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                収集Bot {botHealthy === null ? "状態不明" : botHealthy ? "正常稼働中" : "応答待ち"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {lastRun
                  ? `最終実行: ${timeAgo(lastRun.ran_at)} ・ ${lastRun.items_inserted}件追加`
                  : "1時間ごとにRSSを自動収集"}
              </div>
            </div>
          </div>
          {lastRun && (
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 28 }}>
              {botRuns.slice(0, 8).reverse().map((run) => (
                <div key={run.id} title={`${timeAgo(run.ran_at)}: ${run.items_inserted}件`}
                  style={{
                    width: 5, borderRadius: 2,
                    height: Math.max(4, Math.min(28, run.items_inserted * 4 + 4)),
                    background: run.status === "success" ? "var(--accent)" : "var(--up)",
                    opacity: 0.4 + (run.items_inserted > 0 ? 0.6 : 0),
                  }} />
              ))}
            </div>
          )}
        </div>

        {/* KPI（最大値上げ・平均変動を削除し、値上げ/値下げ件数に） */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: "var(--accent-light)" }}>📊</div>
            <div>
              <div className="kpi-label">総データ数</div>
              <div className="kpi-value">{kpi.total}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: "#eef2ff" }}>🏢</div>
            <div>
              <div className="kpi-label">企業数</div>
              <div className="kpi-value">{kpi.companies}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: "var(--up-bg)" }}>📈</div>
            <div>
              <div className="kpi-label">値上げ</div>
              <div className="kpi-value" style={{ color: "var(--up)" }}>{kpi.ups}</div>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: "var(--down-bg)" }}>📉</div>
            <div>
              <div className="kpi-label">値下げ</div>
              <div className="kpi-value" style={{ color: "var(--down)" }}>{kpi.downs}</div>
            </div>
          </div>
        </div>

        {/* 今日のサマリー（毎日見たくなる仕掛け） */}
        <div className="daily-summary">
          <div className="daily-item">
            <div className="daily-num">{engagement.todayCount}</div>
            <div className="daily-label">本日実施</div>
          </div>
          <div className="daily-divider" />
          <div className="daily-item">
            <div className="daily-num" style={{ color: "var(--up)" }}>{engagement.thisWeekCount}</div>
            <div className="daily-label">直近7日</div>
          </div>
          <div className="daily-divider" />
          <a href="/calendar" className="daily-item" style={{ cursor: "pointer" }}>
            <div className="daily-num" style={{ color: "var(--accent)" }}>{engagement.upcomingCount}</div>
            <div className="daily-label">今後7日の予定 →</div>
          </a>
        </div>

        {/* 衝撃の値上げ率ランキング（共有したくなる仕掛け） */}
        {shockRanking.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div className="section-head">
              <div className="section-label">😱 衝撃の値上げ率ランキング</div>
            </div>
            <div className="shock-grid">
              {shockRanking.map((item, i) => (
                <div key={item.id} className="shock-card" onClick={() => router.push(`/detail/${item.id}`)}
                  style={{ background: ["linear-gradient(135deg,#ff6b6b,#ee5253)", "linear-gradient(135deg,#feca57,#ff9f43)", "linear-gradient(135deg,#54a0ff,#2e86de)"][i] }}>
                  <div className="shock-rank">{["🥇", "🥈", "🥉"][i]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.95 }}>{item.company}</div>
                  <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 8, minHeight: 28 }}>{item.product.slice(0, 24)}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>+{item.percent.toFixed(0)}%</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{item.old_price}円 → {item.new_price}円</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 最新速報（横スクロール） */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-head">
            <div className="section-label">最新の価格変動</div>
            <a href="/analysis" className="section-link">分析を見る →</a>
          </div>
          <div className="hscroll">
            {enriched.slice(0, 12).map((item) => {
              const dateLabel = displayDate(item);
              return (
                <div key={item.id} onClick={() => router.push(`/company/${item.slug}`)} className="snap-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{item.company}</div>
                    <span className="mini-tag" style={{ background: TAG_COLORS[item.tag] + "18", color: TAG_COLORS[item.tag] }}>
                      {item.tag}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, minHeight: 32 }}>
                    {item.product.slice(0, 28)}
                    {item.amount && <span style={{ color: "var(--text-muted)" }}> ({item.amount})</span>}
                  </div>
                  {dateLabel && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>📅 {dateLabel}</div>}
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 14 }}>
                      <span style={{ color: "var(--text-muted)", textDecoration: "line-through", fontSize: 12 }}>{item.old_price}円</span>
                      <span style={{ fontWeight: 800, marginLeft: 6 }}>{item.new_price}円</span>
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

        {/* フィルター + 検索 + ソート */}
        <div className="filter-bar">
          <input
            placeholder="🔍 企業名・商品名で検索..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <div className="sort-tabs">
            <button onClick={() => setSortBy("new")} className={sortBy === "new" ? "sort-active" : ""}>新着順</button>
            <button onClick={() => setSortBy("percent")} className={sortBy === "percent" ? "sort-active" : ""}>変動率順</button>
            <button onClick={() => setSortBy("diff")} className={sortBy === "diff" ? "sort-active" : ""}>変動額順</button>
          </div>
        </div>

        <div style={{ marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setSelectedTag(null)} className="tag-pill" style={{
            background: selectedTag === null ? "var(--text-primary)" : "var(--surface)",
            color: selectedTag === null ? "#fff" : "var(--text-secondary)",
            borderColor: selectedTag === null ? "var(--text-primary)" : "var(--border)",
          }}>すべて</button>
          {allTags.map(([tag, count]) => (
            <button key={tag} onClick={() => setSelectedTag(tag === selectedTag ? null : tag)} className="tag-pill" style={{
              borderColor: selectedTag === tag ? TAG_COLORS[tag] : "var(--border)",
              background: selectedTag === tag ? TAG_COLORS[tag] + "15" : "var(--surface)",
              color: selectedTag === tag ? TAG_COLORS[tag] : "var(--text-secondary)",
            }}>{tag} <span style={{ opacity: 0.6 }}>{count}</span></button>
          ))}
        </div>

        {/* 一覧 */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <div className="section-label">価格変動一覧 {filtered.length > 0 && `(${filtered.length})`}</div>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>読み込み中...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>該当データがありません</div>
          ) : (
            filtered.map((item) => {
              const dateLabel = displayDate(item);
              return (
                <div key={item.id} className="list-row" onClick={() => router.push(`/company/${item.slug}`)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div className="avatar" style={{ background: TAG_COLORS[item.tag] + "18", color: TAG_COLORS[item.tag] }}>
                      {item.company.slice(0, 1)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{item.company}</span>
                        <span className="mini-tag" style={{ background: TAG_COLORS[item.tag] + "18", color: TAG_COLORS[item.tag] }}>{item.tag}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.product}{item.amount && <span> ({item.amount})</span>}{dateLabel && <span> · 📅 {dateLabel}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14 }}>
                      <span style={{ color: "var(--text-muted)", fontSize: 12, textDecoration: "line-through" }}>{item.old_price}</span>
                      <span style={{ fontWeight: 800, marginLeft: 6 }}>{item.new_price}円</span>
                    </div>
                    <span className={item.diff > 0 ? "badge-up" : "badge-down"} style={{ marginTop: 4 }}>
                      {item.diff > 0 ? "+" : ""}{item.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
