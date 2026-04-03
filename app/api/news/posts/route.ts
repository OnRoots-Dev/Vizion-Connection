import { NextResponse } from "next/server";
import { getNewsPosts } from "@/lib/news";

export async function GET() {
    const posts = await getNewsPosts();
    return NextResponse.json({ posts });
}
