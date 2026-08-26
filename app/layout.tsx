import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Saira_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";

// Google Fonts: Saira Condensed（数字・ゲーミフィケーション用）, Inter（本文用
const saira = Saira_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-saira",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Label/HUD用モノスペース（旧'Space Mono'幽霊指定の正式な置換先）
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const bebas = localFont({
  src: "../public/fonts/BebasNeue-Regular.ttf",
  variable: "--font-bebas",
  display: "swap",
});

const noto = localFont({
  src: [
    { path: "../public/fonts/NotoSansJP-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/NotoSansJP-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/NotoSansJP-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/NotoSansJP-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  // ← 既存のmetadataをそのまま残す（変更不要）
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
        url: "/images/og-image.png",
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
    <html lang="ja" className={cn(bebas.variable, noto.variable, saira.variable, inter.variable, jetbrains.variable, "font-sans")}>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
