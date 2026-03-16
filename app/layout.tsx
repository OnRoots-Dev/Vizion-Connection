import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import { Bebas_Neue, Noto_Sans_JP } from "next/font/google";
import type { Metadata } from "next";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-bebas" });
const noto = Noto_Sans_JP({ weight: ["300", "400", "700", "900"], subsets: ["latin"], display: "swap", variable: "--font-noto" });

export const metadata: Metadata = {
  metadataBase: new URL("https://vizion-connection.jp"),
  title: {
    default: "Vizion Connection | スポーツの信頼を可視化するプラットフォーム",
    template: "%s | Vizion Connection",
  },
  description:
    "アスリート・トレーナー・サポーター・企業をつなぐ、スポーツ特化型プロフィール＆信頼可視化プラットフォーム。プロフィールカードの作成・共有・Cheer・Discoveryで新しいつながりを。",
  keywords: [
    "アスリート", "スポーツ", "プロフィール", "トレーナー", "スポンサー",
    "Cheer", "Discovery", "スポーツコミュニティ", "信頼", "Vizion Connection"
  ],
  authors: [{ name: "Vizion Connection" }],
  creator: "Vizion Connection",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://vizion-connection.jp",
    siteName: "Vizion Connection",
    title: "Vizion Connection | スポーツの信頼を可視化するプラットフォーム",
    description:
      "アスリート・トレーナー・サポーター・企業をつなぐ、スポーツ特化型プロフィール＆信頼可視化プラットフォーム。",
    images: [
      {
        url: "/images/og-image.png", // ← OGP画像を用意してください（後述）
        width: 1200,
        height: 630,
        alt: "Vizion Connection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vizion Connection | スポーツの信頼を可視化するプラットフォーム",
    description:
      "アスリート・トレーナー・サポーター・企業をつなぐ、スポーツ特化型プロフィール＆信頼可視化プラットフォーム。",
    images: ["/images/og-image.png"],
    // site: "@your_twitter_handle", // Xアカウントがあれば追加
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://vizion-connection.jp",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja" className={`${bebas.variable} ${noto.variable}`}>
            <body>
                {children}
                <SpeedInsights />
            </body>
        </html>
    );
}
