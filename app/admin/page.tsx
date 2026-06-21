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
};

export default function AdminPage() {
  const [data, setData] = useState<PriceChange[]>([]);
  const [company, setCompany] = useState("");
  const [product, setProduct] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [msg, setMsg] = useState("");

  const fetchData = async () => {
    const { data } = await supabase
      .from("price_changes")
      .select("*")
      .order("id", { ascending: false });
    setData(data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    const companyKey = company as keyof typeof COMPANIES;
    const info = COMPANIES[companyKey];
    if (!info) { setMsg("企業を選択してください"); return; }
    if (!product || !oldPrice || !newPrice) { setMsg("全項目を入力してください"); return; }

    const { error } = await supabase.from("price_changes").insert({
      company: info.name,
      slug: info.slug,
      product,
      old_price: Number(oldPrice),
      new_price: Number(newPrice),
      change_type: Number(newPrice) > Number(oldPrice) ? "increase" : "decrease",
      source_url: "manual",
      article_text: "手動入力",
    });

    if (error) { setMsg("エラー: " + error.message); return; }
    setMsg("追加しました");
    setProduct(""); setOldPrice(""); setNewPrice("");
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    await supabase.from("price_changes").delete().eq("id", id);
    setMsg("削除しました");
    fetchData();
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Admin</h1>

        <div style={styles.form}>
          <select value={company} onChange={(e) => setCompany(e.target.value)} style={styles.input}>
            <option value="">企業を選択</option>
            {Object.entries(COMPANIES).map(([key, c]) => (
              <option key={key} value={key}>{c.name}</option>
            ))}
          </select>
          <input placeholder="商品名" value={product} onChange={(e) => setProduct(e.target.value)} style={styles.input} />
          <input placeholder="旧価格" type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} style={styles.input} />
          <input placeholder="新価格" type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} style={styles.input} />
          <button onClick={handleAdd} style={styles.btn}>追加</button>
        </div>

        {msg && <div style={styles.msg}>{msg}</div>}

        <div style={styles.list}>
          {data.map((item) => (
            <div key={item.id} style={styles.row}>
              <div>
                <b>{item.company}</b> - {item.product}
                <div style={styles.small}>{item.old_price} → {item.new_price}</div>
              </div>
              <button onClick={() => handleDelete(item.id)} style={styles.delBtn}>削除</button>
            </div>
          ))}
        </div>
      </div>

      <a href="/" style={styles.back}>← ダッシュボードに戻る</a>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f6f7f9", fontFamily: "system-ui", padding: 40 },
  container: { maxWidth: 900, margin: "0 auto" },
  title: { fontSize: 28, fontWeight: 800, marginBottom: 20 },
  form: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  input: { padding: 10, border: "1px solid #ddd", borderRadius: 8, fontSize: 14 },
  btn: { padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 },
  msg: { padding: 10, background: "#dcfce7", borderRadius: 8, marginBottom: 16, fontSize: 14 },
  list: { background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" },
  row: { padding: 14, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" },
  small: { fontSize: 12, color: "#888" },
  delBtn: { padding: "6px 12px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 },
  back: { display: "block", maxWidth: 900, margin: "30px auto 0", color: "#2563eb", textDecoration: "none", fontWeight: 600 },
};
