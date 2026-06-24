"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { COMPANIES } from "@/lib/companies";

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

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
}

export default function AdminPage() {
  const [data, setData] = useState<PriceChange[]>([]);
  const [company, setCompany] = useState("");
  const [product, setProduct] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [changeDate, setChangeDate] = useState("");
  const [articleDate, setArticleDate] = useState("");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [reports, setReports] = useState<{ id: number; report_type: string; detail?: string; price_change_id: number; created_at: string }[]>([]);

  const fetchData = async () => {
    const { data } = await supabase.from("price_changes").select("*").order("id", { ascending: false });
    setData(data || []);
    const { data: rep } = await supabase.from("reports").select("*").eq("status", "open").order("created_at", { ascending: false });
    if (rep) setReports(rep);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    const companyKey = company as keyof typeof COMPANIES;
    const info = COMPANIES[companyKey];
    if (!info) { setMsg("企業を選択してください"); return; }
    if (!product || !oldPrice || !newPrice) { setMsg("商品名・価格を入力してください"); return; }

    const { error } = await supabase.from("price_changes").insert({
      company: info.name, slug: info.slug, product,
      old_price: Number(oldPrice), new_price: Number(newPrice),
      change_type: Number(newPrice) > Number(oldPrice) ? "increase" : "decrease",
      source_url: "manual", article_text: "手動入力",
      article_date: articleDate || null,
      change_date: changeDate || null,
      amount: amount || null,
      is_verified: true,
    });

    if (error) { setMsg("エラー: " + error.message); return; }
    setMsg("追加しました");
    setProduct(""); setOldPrice(""); setNewPrice(""); setAmount("");
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    await supabase.from("price_changes").delete().eq("id", id);
    setMsg("削除しました");
    fetchData();
  };

  const resolveReport = async (id: number) => {
    await supabase.from("reports").update({ status: "resolved" }).eq("id", id);
    fetchData();
  };

  const reportLabel: Record<string, string> = {
    wrong_price: "価格の誤り",
    wrong_date: "日付の誤り",
    wrong_amount: "内容量の誤り",
    other: "その他",
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px 14px", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", fontSize: 14, fontFamily: "var(--font)",
    outline: "none", background: "var(--surface)",
  };

  return (
    <div className="container">
      <h1 className="page-title">管理画面</h1>
      <p className="page-sub">データの追加・削除・日付修正</p>

      <div className="card" style={{ marginBottom: 28 }}>
        <div className="section-label">データ追加</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <select value={company} onChange={(e) => setCompany(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
            <option value="">企業を選択</option>
            {Object.entries(COMPANIES).map(([key, c]) => (
              <option key={key} value={key}>{c.name}</option>
            ))}
          </select>
          <input placeholder="商品名" value={product} onChange={(e) => setProduct(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 140 }} />
          <input placeholder="旧価格" type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} style={{ ...inputStyle, width: 100 }} />
          <input placeholder="新価格" type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} style={{ ...inputStyle, width: 100 }} />
          <input placeholder="内容量(例:60g)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ ...inputStyle, width: 130 }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>値上げ日:</label>
            <input type="date" value={changeDate} onChange={(e) => setChangeDate(e.target.value)} style={{ ...inputStyle, width: 150 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>記事日:</label>
            <input type="date" value={articleDate} onChange={(e) => setArticleDate(e.target.value)} style={{ ...inputStyle, width: 150 }} />
          </div>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>※日付は不明なら空欄でOK（表示されません）</span>
          <button onClick={handleAdd} style={{
            padding: "10px 24px", background: "var(--accent)", color: "#fff",
            border: "none", borderRadius: "var(--radius)", cursor: "pointer",
            fontWeight: 700, fontSize: 14, fontFamily: "var(--font)",
          }}>追加</button>
        </div>
        {msg && (
          <div style={{
            marginTop: 12, padding: "8px 14px",
            background: msg.includes("エラー") ? "var(--up-bg)" : "var(--down-bg)",
            color: msg.includes("エラー") ? "var(--up)" : "var(--down)",
            borderRadius: "var(--radius)", fontSize: 13, fontWeight: 600,
          }}>{msg}</div>
        )}
      </div>

      {reports.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 28, border: "1px solid var(--up)" }}>
          <div style={{ padding: "16px 20px 8px" }}>
            <div className="section-label" style={{ color: "var(--up)" }}>🚩 ユーザーからの誤り報告 ({reports.length}件)</div>
          </div>
          {reports.map((r) => (
            <div key={r.id} className="list-row">
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {reportLabel[r.report_type] || r.report_type}
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400, marginLeft: 8 }}>
                    データID: {r.price_change_id}
                  </span>
                </div>
                {r.detail && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{r.detail}</div>}
              </div>
              <button onClick={() => resolveReport(r.id)} style={{
                padding: "6px 14px", background: "var(--down-bg)", color: "var(--down)",
                border: "none", borderRadius: "var(--radius)", cursor: "pointer",
                fontSize: 12, fontWeight: 700, fontFamily: "var(--font)",
              }}>対応済み</button>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px 8px" }}>
          <div className="section-label">登録データ ({data.length}件)</div>
        </div>
        {data.map((item) => (
          <div key={item.id} className="list-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.company}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {item.product}{item.amount && ` (${item.amount})`} · {item.old_price}円 → {item.new_price}円
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                {item.change_date && <span>📅 値上げ日: {formatDate(item.change_date)}</span>}
                {item.change_date && item.article_date && <span> · </span>}
                {item.article_date && <span>📰 記事日: {formatDate(item.article_date)}</span>}
              </div>
            </div>
            <button onClick={() => handleDelete(item.id)} style={{
              padding: "6px 14px", background: "var(--up-bg)", color: "var(--up)",
              border: "none", borderRadius: "var(--radius)", cursor: "pointer",
              fontSize: 12, fontWeight: 700, fontFamily: "var(--font)",
            }}>削除</button>
          </div>
        ))}
      </div>
    </div>
  );
}
