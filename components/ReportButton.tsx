"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  priceChangeId: string;
};

const TYPES = [
  { key: "wrong_price", label: "価格が間違っている" },
  { key: "wrong_date", label: "日付が間違っている" },
  { key: "wrong_amount", label: "内容量が間違っている" },
  { key: "other", label: "その他" },
];

export default function ReportButton({ priceChangeId }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("wrong_price");
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    try {
      await supabase.from("reports").insert({
        price_change_id: priceChangeId,
        report_type: type,
        detail: detail.slice(0, 500),
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--down-bg)", color: "var(--down)", borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: "center" }}>
        ✓ 報告ありがとうございます。確認のうえ修正します。
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{
          width: "100%", padding: "10px", background: "transparent",
          border: "1px dashed var(--border)", borderRadius: 10,
          color: "var(--text-muted)", fontSize: 12, fontWeight: 600,
          cursor: "pointer", fontFamily: "var(--font)",
        }}>
          🚩 情報の誤りを報告する
        </button>
      ) : (
        <div style={{ padding: 16, background: "var(--bg)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>情報の誤りを報告</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {TYPES.map((t) => (
              <label key={t.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="radio" name="reportType" checked={type === t.key} onChange={() => setType(t.key)} />
                {t.label}
              </label>
            ))}
          </div>
          <textarea
            placeholder="正しい情報や補足があればご記入ください（任意）"
            value={detail} onChange={(e) => setDetail(e.target.value)}
            rows={3}
            style={{
              width: "100%", padding: "8px 12px", border: "1px solid var(--border)",
              borderRadius: 8, fontSize: 13, fontFamily: "var(--font)", resize: "vertical",
              outline: "none", marginBottom: 10,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setOpen(false)} style={{
              flex: 1, padding: "9px", background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, fontSize: 13, fontWeight: 600, color: "var(--text-secondary)",
              cursor: "pointer", fontFamily: "var(--font)",
            }}>キャンセル</button>
            <button onClick={submit} disabled={sending} style={{
              flex: 1, padding: "9px", background: "var(--accent)", border: "none",
              borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#fff",
              cursor: "pointer", fontFamily: "var(--font)", opacity: sending ? 0.6 : 1,
            }}>{sending ? "送信中..." : "報告する"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
