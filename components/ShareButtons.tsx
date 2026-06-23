"use client";

type Props = {
  company: string;
  product: string;
  oldPrice: number;
  newPrice: number;
  percent: number;
};

export default function ShareButtons({ company, product, oldPrice, newPrice, percent }: Props) {
  const text = `【値上げ情報】${company} ${product} が ${oldPrice}円→${newPrice}円 (${percent > 0 ? "+" : ""}${percent.toFixed(1)}%) #値上げウォッチ`;
  const url = typeof window !== "undefined" ? window.location.href : "https://neagewatch.vercel.app";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "値上げウォッチ", text, url });
      } catch {
        /* キャンセル */
      }
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert("クリップボードにコピーしました");
    }
  };

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;

  const btn: React.CSSProperties = {
    flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)",
    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)",
    background: "var(--surface)", color: "var(--text-secondary)",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    transition: "all 0.18s",
  };

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
      <button onClick={handleShare} style={{ ...btn, background: "var(--accent)", color: "#fff", border: "none" }}>
        🔗 シェア
      </button>
      <a href={xUrl} target="_blank" rel="noopener noreferrer" style={btn}>𝕏 ポスト</a>
      <a href={lineUrl} target="_blank" rel="noopener noreferrer" style={btn}>LINE</a>
    </div>
  );
}
