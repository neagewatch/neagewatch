"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { detectTag, TAG_COLORS } from "@/lib/tags";
import { useRouter } from "next/navigation";

type PriceChange = {
  id: string;
  company: string;
  slug: string;
  product: string;
  old_price: number;
  new_price: number;
  article_date?: string;
  change_date?: string;
};

function ymd(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatJP(d: Date): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}月${d.getDate()}日(${days[d.getDay()]})`;
}

export default function CalendarPage() {
  const [data, setData] = useState<PriceChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"upcoming" | "past">("upcoming");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase.from("price_changes").select("*");
      setData(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const grouped = useMemo(() => {
    const withDate = data
      .map((item) => ({ ...item, dateObj: ymd(item.change_date || item.article_date) }))
      .filter((item) => item.dateObj !== null) as (PriceChange & { dateObj: Date })[];

    const filtered = withDate.filter((item) =>
      view === "upcoming" ? item.dateObj >= today : item.dateObj < today
    );

    filtered.sort((a, b) =>
      view === "upcoming"
        ? a.dateObj.getTime() - b.dateObj.getTime()
        : b.dateObj.getTime() - a.dateObj.getTime()
    );

    // 月キーでグループ化
    const map: Record<string, typeof filtered> = {};
    filtered.forEach((item) => {
      const key = `${item.dateObj.getFullYear()}年${item.dateObj.getMonth() + 1}月`;
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [data, view, today]);

  const monthKeys = Object.keys(grouped);

  return (
    <div className="container">
      <h1 className="page-title">値上げカレンダー</h1>
      <p className="page-sub">実施日ベースで価格変動を時系列表示。今後の値上げ予定を先取りチェック。</p>

      <div className="sort-tabs" style={{ marginBottom: 24, display: "inline-flex" }}>
        <button onClick={() => setView("upcoming")} className={view === "upcoming" ? "sort-active" : ""}>
          📅 今後の予定
        </button>
        <button onClick={() => setView("past")} className={view === "past" ? "sort-active" : ""}>
          🕐 過去の変動
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>読み込み中...</div>
      ) : monthKeys.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
          {view === "upcoming" ? "今後の値上げ予定データがありません" : "過去の変動データがありません"}
        </div>
      ) : (
        monthKeys.map((month) => (
          <div key={month} style={{ marginBottom: 28 }}>
            <div style={{
              display: "inline-block", fontSize: 14, fontWeight: 800,
              background: "var(--accent)", color: "#fff",
              padding: "5px 14px", borderRadius: 20, marginBottom: 14,
            }}>{month}</div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {grouped[month].map((item) => {
                const tag = detectTag(item.product);
                const diff = item.new_price - item.old_price;
                const percent = item.old_price !== 0 ? (diff / item.old_price) * 100 : 0;
                const isFuture = item.dateObj >= today;
                return (
                  <div key={item.id} className="list-row" onClick={() => router.push(`/company/${item.slug}`)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <div style={{
                        textAlign: "center", flexShrink: 0,
                        minWidth: 52, padding: "6px 8px",
                        background: isFuture ? "var(--accent-light)" : "var(--bg)",
                        borderRadius: 10,
                      }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: isFuture ? "var(--accent)" : "var(--text-secondary)", lineHeight: 1 }}>
                          {item.dateObj.getDate()}
                        </div>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2 }}>
                          {["日", "月", "火", "水", "木", "金", "土"][item.dateObj.getDay()]}
                        </div>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{item.company}</span>
                          <span className="mini-tag" style={{ background: TAG_COLORS[tag] + "18", color: TAG_COLORS[tag] }}>{tag}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.product}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 14 }}>
                        <span style={{ color: "var(--text-muted)", fontSize: 12, textDecoration: "line-through" }}>{item.old_price}</span>
                        <span style={{ fontWeight: 800, marginLeft: 6 }}>{item.new_price}円</span>
                      </div>
                      <span className={diff > 0 ? "badge-up" : "badge-down"} style={{ marginTop: 4 }}>
                        {diff > 0 ? "+" : ""}{percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
