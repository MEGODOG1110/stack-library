import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stack Library",
  description: "購入前に技術書の所蔵を確認する個人用ライブラリ",
  applicationName: "Stack Library",
  appleWebApp: { capable: true, title: "Stack Library", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icons/stack-library.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = { themeColor: "#111A20" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
