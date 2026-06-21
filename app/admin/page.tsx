"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [company, setCompany] = useState("");
  const [slug, setSlug] = useState("");
  const [product, setProduct] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const addData = async () => {
    const { error } = await supabase.from("price_changes").insert([
      {
        company,
        slug,
        product,
        old_price: Number(oldPrice),
        new_price: Number(newPrice),
      },
    ]);

    if (error) {
      alert("エラー: " + error.message);
      return;
    }

    alert("追加しました！");
    setCompany("");
    setSlug("");
    setProduct("");
    setOldPrice("");
    setNewPrice("");
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>管理画面</h1>

      <input placeholder="会社名" value={company} onChange={(e) => setCompany(e.target.value)} />
      <br />

      <input placeholder="slug（mcdonalds）" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <br />

      <input placeholder="商品名" value={product} onChange={(e) => setProduct(e.target.value)} />
      <br />

      <input placeholder="旧価格" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
      <br />

      <input placeholder="新価格" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
      <br />

      <button onClick={addData}>追加</button>
    </main>
  );
}