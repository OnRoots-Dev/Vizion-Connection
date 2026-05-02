// app/api/og/[slug]/route.tsx

import { ImageResponse } from "next/og";
import { getOgProfileData } from "@/features/og/server/og-data-service";
import { StandardOGCard } from "@/features/og/components/StandardOGCard";
import { StoriesCard } from "@/features/og/components/StoriesCard";
import { withCache } from "@/lib/og/response-helper";
import { createElement as h } from "react";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const format = new URL(req.url).searchParams.get("format") ?? "og";
    const isStories = format === "stories";

    const result = await getOgProfileData(slug);
    if (!result.success) {
        const w = isStories ? 1080 : 1200;
        const hh = isStories ? 1920 : 630;
        return withCache(new ImageResponse(
            h("div", { style: { width: `${w}px`, height: `${hh}px`, display: "flex", alignItems: "center", justifyContent: "center", background: "#07070e" } },
                h("span", { style: { fontSize: "13px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "monospace" } }, "VIZION CONNECTION")
            ), { width: w, height: hh }
        ));
    }

    const element = isStories ? StoriesCard(result.data) : StandardOGCard(result.data);
    const width = isStories ? 1080 : 1200;
    const height = isStories ? 1920 : 630;
    return withCache(new ImageResponse(element, { width, height }));
}
