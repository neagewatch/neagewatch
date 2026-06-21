import "./globals.css";

export const metadata = {
  title: "NeageWatch - 価格変動トラッカー",
  description: "日本の価格変動をリアルタイムで追跡・可視化",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <a href="/" className="nav-logo">NeageWatch</a>
            <ul className="nav-links">
              <li><a href="/">ダッシュボード</a></li>
              <li><a href="/company">企業一覧</a></li>
              <li><a href="/admin">管理</a></li>
            </ul>
          </div>
        </nav>
        {children}
        <footer className="footer">© 2026 NeageWatch</footer>
      </body>
    </html>
  );
}
