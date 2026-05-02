import { NextResponse } from "next/server";

export function withCache(r: Response): Response {
    const headers = new Headers(r.headers);
    headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return new NextResponse(r.body, { headers, status: r.status });
}
