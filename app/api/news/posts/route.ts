import { NextResponse } from "next/server";
import { getFeaturedNewsPost, getFeaturedNewsPosts, getNewsPosts } from "@/lib/news";

export async function GET() {
    const [posts, featured, featuredTop] = await Promise.all([
        getNewsPosts(),
        getFeaturedNewsPost(),
        getFeaturedNewsPosts(5),
    ]);
    return NextResponse.json({ posts, featured, featuredTop });
}
