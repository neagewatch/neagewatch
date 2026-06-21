import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "NeageWatch（値上げウォッチ）- 日本の価格変動をリアルタイム追跡",
    template: "%s | NeageWatch",
  },
  description: "日本の食品・日用品・外食チェーンの値上げ・値下げ情報をリアルタイムで追跡。企業別・カテゴリ別の価格変動データを無料で閲覧できます。",
  keywords: ["値上げ", "価格変動", "物価", "食品値上げ", "値上げ情報", "価格改定", "日本", "インフレ", "物価上昇", "値下げ"],
  authors: [{ name: "NeageWatch" }],
  creator: "NeageWatch",
  metadataBase: new URL("https://neagewatch.vercel.app"),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://neagewatch.vercel.app",
    siteName: "NeageWatch",
    title: "NeageWatch - 日本の価格変動をリアルタイム追跡",
    description: "日本の食品・日用品・外食チェーンの値上げ・値下げ情報をリアルタイムで追跡。企業別・カテゴリ別の価格変動データを無料で閲覧。",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeageWatch - 値上げウォッチ",
    description: "日本の価格変動をリアルタイムで追跡・可視化",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://neagewatch.vercel.app",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "NeageWatch",
    alternateName: "値上げウォッチ",
    url: "https://neagewatch.vercel.app",
    description: "日本の食品・日用品・外食チェーンの値上げ・値下げ情報をリアルタイムで追跡",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    inLanguage: "ja",
  };

  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <a href="/" className="nav-logo">NeageWatch</a>
            <ul className="nav-links">
              <li><a href="/">ダッシュボード</a></li>
              <li><a href="/company">企業一覧</a></li>
              <li><a href="/analysis">分析</a></li>
              <li><a href="/admin">管理</a></li>
            </ul>
          </div>
        </nav>
        {children}
        <footer className="footer">
          <div style={{ marginBottom: 8 }}>
            <a href="/" style={{ margin: "0 12px", color: "var(--text-muted)", fontSize: 12 }}>ダッシュボード</a>
            <a href="/company" style={{ margin: "0 12px", color: "var(--text-muted)", fontSize: 12 }}>企業一覧</a>
            <a href="/analysis" style={{ margin: "0 12px", color: "var(--text-muted)", fontSize: 12 }}>分析</a>
          </div>
          © 2026 NeageWatch - 日本の価格変動トラッカー
        </footer>
      </body>
    </html>
  );
}
