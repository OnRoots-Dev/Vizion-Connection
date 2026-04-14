import { NextRequest, NextResponse } from "next/server";
import { getLocalFeed } from "@/lib/news/server";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const prefecture = searchParams.get("prefecture")?.trim() ?? "";
        const region = searchParams.get("region")?.trim() ?? "";

        const articles = await getLocalFeed(prefecture, region);
        return NextResponse.json({ articles });
    } catch (err) {
        console.error("[/api/news/local]", err);
        return NextResponse.json({ articles: [] }, { status: 500 });
    }
}
