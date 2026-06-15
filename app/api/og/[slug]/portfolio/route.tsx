// app/api/og/[slug]/portfolio/route.tsx
// Portfolio 専用 OG 画像（1200×630）。非公開/存在しない slug は中立な
// ブランドのみのプレースホルダを返し、ユーザー情報を一切含めない。

import { ImageResponse } from "next/og";
import { getOgPortfolioData } from "@/features/og/server/og-portfolio-data";
import { PortfolioOGCard } from "@/features/og/components/PortfolioOGCard";
import { StoriesPortfolioOGCard } from "@/features/og/components/StoriesPortfolioOGCard";
import { withCache } from "@/lib/og/response-helper";
import { createElement as h } from "react";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const isStories = new URL(req.url).searchParams.get("format") === "stories";
    const width = isStories ? 1080 : 1200;
    const height = isStories ? 1920 : 630;

    const result = await getOgPortfolioData(slug);
    if (!result.success) {
        return withCache(new ImageResponse(
            h("div", { style: { width: `${width}px`, height: `${height}px`, display: "flex", alignItems: "center", justifyContent: "center", background: "#07070e" } },
                h("span", { style: { fontSize: "13px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "monospace", display: "flex" } }, "VIZION CONNECTION"),
            ), { width, height },
        ));
    }

    const card = isStories ? StoriesPortfolioOGCard(result.data) : PortfolioOGCard(result.data);
    return withCache(new ImageResponse(card, { width, height }));
}
