import { NextRequest, NextResponse } from "next/server";
import { getDiscoveryUsers } from "@/features/discovery/server/discovery-service";

export async function GET(req: NextRequest) {
    const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
    const role = req.nextUrl.searchParams.get("role") ?? "";
    const region = (req.nextUrl.searchParams.get("region") ?? "").trim();
    const prefecture = (req.nextUrl.searchParams.get("prefecture") ?? "").trim();
    const sport = (req.nextUrl.searchParams.get("sport") ?? "").trim();
    const sort = req.nextUrl.searchParams.get("sort") ?? "all";

    const data = await getDiscoveryUsers({ q, role, region, prefecture, sport, sort });
    return NextResponse.json(data);
}
