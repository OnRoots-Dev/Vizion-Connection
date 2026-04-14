import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

export const revalidate = 300;

type NewsArticle = {
    id: string;
    title: string;
    source: string;
    sourceLogoUrl?: string;
    url: string;
    imageUrl?: string;
    publishedAt: string;
};

function textBetween(value: string, start: string, end: string) {
    const s = value.indexOf(start);
    if (s === -1) return "";
    const e = value.indexOf(end, s + start.length);
    if (e === -1) return "";
    return value.slice(s + start.length, e);
}

function decodeHtmlEntities(input: string) {
    return input
        .replaceAll("&amp;", "&")
        .replaceAll("&quot;", "\"")
        .replaceAll("&#39;", "'")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">");
}

function attrValue(tag: string, attr: string): string {
    const m = tag.match(new RegExp(`${attr}="([^"]+)"`));
    return m?.[1] ?? "";
}

function parseGoogleNewsRss(xml: string): NewsArticle[] {
    const items = xml.split("<item>").slice(1);
    return items
        .map((chunk) => {
            const title = decodeHtmlEntities(textBetween(chunk, "<title>", "</title>").trim());
            const url = textBetween(chunk, "<link>", "</link>").trim();
            const pubDate = textBetween(chunk, "<pubDate>", "</pubDate>").trim();
            const source = decodeHtmlEntities(textBetween(chunk, "<source", "</source>")
                .split(">")
                .slice(1)
                .join(">")
                .trim());

            const mediaTag = chunk.match(/<media:content[^>]*>/i)?.[0] ?? "";
            const enclosureTag = chunk.match(/<enclosure[^>]*>/i)?.[0] ?? "";
            const rawImageUrl = attrValue(mediaTag, "url") || attrValue(enclosureTag, "url");
            const imageUrl = rawImageUrl ? decodeHtmlEntities(rawImageUrl) : undefined;

            if (!title || !url || !pubDate) return null;

            const publishedAt = new Date(pubDate).toISOString();
            const id = createHash("sha1").update(url).digest("hex");

            const article: NewsArticle = {
                id,
                title,
                source: source || "News",
                url,
                publishedAt,
                ...(imageUrl ? { imageUrl } : {}),
            };

            return article;
        })
        .filter((v): v is NewsArticle => v !== null);
}

export async function GET() {
    try {
        const rssUrl = "https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja";
        const res = await fetch(rssUrl, {
            headers: {
                "User-Agent": "VizionConnectionBot/1.0",
            },
            next: { revalidate: 300 },
        });

        if (!res.ok) {
            return NextResponse.json({ articles: [] }, { status: 502 });
        }

        const xml = await res.text();
        const articles = parseGoogleNewsRss(xml).slice(0, 20);
        return NextResponse.json({ articles });
    } catch (err) {
        console.error("[/api/news/top]", err);
        return NextResponse.json({ articles: [] }, { status: 500 });
    }
}
