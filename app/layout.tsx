// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Vizion Connection",
    description: "スポーツの役割と信頼を可視化するネットワーク",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja">
            <body>
                {children}
            </body>
        </html>
    );
}