import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next";
import "./globals.css";
import { Bebas_Neue, Noto_Sans_JP } from "next/font/google";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-bebas" });
const noto = Noto_Sans_JP({ weight: ["300", "400", "700", "900"], subsets: ["latin"], display: "swap", variable: "--font-noto" });

export const metadata: Metadata = {
    title: "Vizion Connection",
    description: "スポーツの役割と信頼を可視化するネットワーク",
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
