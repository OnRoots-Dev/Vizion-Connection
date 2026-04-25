import { NextResponse } from "next/server";

export function GET(req: Request) {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const format = url.searchParams.get("format") ?? "og";

    if (!slug) {
        return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    return NextResponse.redirect(new URL(`/api/og/${slug}?format=${encodeURIComponent(format)}`, url));
}
