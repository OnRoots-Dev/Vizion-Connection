import { XMLParser } from "fast-xml-parser";
import type { UnifiedArticle } from "@/lib/news/types";

export type RssSource = {
    url: string;
    source: string;
    category: string;
};

function isGoogleNewsArticleUrl(url: string): boolean {
    return /^https?:\/\/news\.google\.com\/rss\/articles\//i.test(url);
}

function getCharsetFromContentType(contentType: string | null): string {
    const v = (contentType ?? "").toLowerCase();
    const m = v.match(/charset\s*=\s*([^;\s]+)/i);
    const raw = (m?.[1] ?? "utf-8").replace(/['"]/g, "").trim();
    if (!raw) return "utf-8";

    if (raw === "shift_jis" || raw === "shift-jis" || raw === "sjis" || raw === "x-sjis") return "shift_jis";
    if (raw === "euc-jp" || raw === "eucjp") return "euc-jp";
    if (raw === "utf8") return "utf-8";
    return raw;
}

function detectCharsetFromBuffer(buf: ArrayBuffer): string | null {
    try {
        const u8 = new Uint8Array(buf);
        if (u8.length >= 3 && u8[0] === 0xef && u8[1] === 0xbb && u8[2] === 0xbf) return "utf-8";
        if (u8.length >= 2 && u8[0] === 0xfe && u8[1] === 0xff) return "utf-16be";
        if (u8.length >= 2 && u8[0] === 0xff && u8[1] === 0xfe) return "utf-16le";

        // Try to find XML prolog encoding="..." by decoding a small prefix as latin1.
        const prefixLen = Math.min(u8.length, 256);
        let prefix = "";
        for (let i = 0; i < prefixLen; i += 1) {
            prefix += String.fromCharCode(u8[i] ?? 0);
        }

        const m = prefix.match(/<\?xml[^>]*encoding\s*=\s*["']([^"']+)["']/i);
        const enc = (m?.[1] ?? "").trim();
        if (!enc) return null;
        const normalized = enc.toLowerCase();
        if (normalized === "utf8") return "utf-8";
        if (normalized === "shift_jis" || normalized === "shift-jis" || normalized === "sjis" || normalized === "x-sjis") return "shift_jis";
        if (normalized === "euc-jp" || normalized === "eucjp") return "euc-jp";
        return normalized;
    } catch {
        return null;
    }
}

async function readResponseText(res: Response): Promise<string> {
    const buf = await res.arrayBuffer();
    const headerCharset = getCharsetFromContentType(res.headers.get("content-type"));
    const sniffed = detectCharsetFromBuffer(buf);
    const charset = sniffed ?? headerCharset;

    try {
        return new TextDecoder(charset).decode(buf);
    } catch {
        return new TextDecoder("utf-8").decode(buf);
    }
}

async function fetchTextWithTimeout(url: string, ms: number, init?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, {
            ...init,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeout);
    }
}

function extractMetaImage(html: string): string | null {
    const patterns: RegExp[] = [
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
    ];

    for (const re of patterns) {
        const m = html.match(re);
        const v = (m?.[1] ?? "").trim();
        if (v) return decodeBasicEntities(v);
    }
    return null;
}

async function tryFetchOgImage(url: string): Promise<string | null> {
    try {
        const res = await fetchTextWithTimeout(url, 1800, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; VizionConnectionBot/1.0)" },
            redirect: "follow",
            cache: "no-store",
        });
        if (!res.ok) return null;
        const html = await res.text();
        const img = extractMetaImage(html);
        if (!img) return null;

        // Make relative URLs absolute if needed.
        if (/^https?:\/\//i.test(img)) return img;
        try {
            return new URL(img, url).toString();
        } catch {
            return null;
        }
    } catch {
        return null;
    }
}

function tryDecodeGoogleNewsArticleUrl(inputUrl: string): string | null {
    try {
        if (!isGoogleNewsArticleUrl(inputUrl)) return null;

        const u = new URL(inputUrl);
        const parts = u.pathname.split("/").filter(Boolean);
        const idx = parts.findIndex((p) => p === "articles");
        const token = idx >= 0 ? parts[idx + 1] : undefined;
        if (!token) return null;

        const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
        if (typeof Buffer === "undefined") return null;

        const buf = Buffer.from(normalized, "base64");
        if (!buf || buf.length === 0) return null;

        const http = Buffer.from("http", "utf8");
        const start = buf.indexOf(http);
        if (start < 0) return null;

        let end = start;
        while (end < buf.length) {
            const c = buf[end];
            if (c === undefined) break;
            if (c < 0x20 || c === 0x7f) break;
            end += 1;
        }

        const candidate = buf.slice(start, end).toString("utf8").trim();
        if (!candidate.startsWith("http")) return null;
        if (candidate.includes("news.google.com")) return null;

        void new URL(candidate);
        return candidate;
    } catch {
        return null;
    }
}

async function resolveRedirectUrl(inputUrl: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    try {
        const res = await fetch(inputUrl, {
            redirect: "follow",
            signal: controller.signal,
            headers: {
                "user-agent": "Mozilla/5.0 (compatible; VizionConnectionBot/1.0)",
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            next: { revalidate: 900 },
        });

        const finalUrl = typeof res.url === "string" && res.url.length > 0 ? res.url : inputUrl;
        if (finalUrl && !isGoogleNewsArticleUrl(finalUrl)) return finalUrl;

        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.includes("text/html")) return inputUrl;

        const html = await readResponseText(res);
        const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
        if (canonicalMatch?.[1] && !canonicalMatch[1].includes("news.google.com")) return canonicalMatch[1];

        const urlJsonMatch = html.match(/\"url\"\s*:\s*\"(https?:\\\/\\\/[^\"\\]+(?:\\\/[^\"\\]*)*)\"/i);
        if (urlJsonMatch?.[1]) {
            const decoded = urlJsonMatch[1].replace(/\\\//g, "/");
            if (decoded && !decoded.includes("news.google.com")) return decoded;
        }

        const hrefMatch = html.match(/href=["'](https?:\/\/[^"']+)["']/i);
        if (hrefMatch?.[1] && !hrefMatch[1].includes("news.google.com")) return hrefMatch[1];

        return inputUrl;
    } catch {
        return inputUrl;
    } finally {
        clearTimeout(timeout);
    }
}

async function resolveGoogleNewsUrl(url: string): Promise<string> {
    if (!isGoogleNewsArticleUrl(url)) return url;

    const decoded = tryDecodeGoogleNewsArticleUrl(url);
    if (decoded) return decoded;

    const resolved = await resolveRedirectUrl(url);
    if (!resolved || isGoogleNewsArticleUrl(resolved)) return url;
    return resolved;
}

async function withConcurrencyLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
    const out: R[] = new Array(items.length);
    let cursor = 0;

    const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }).map(async () => {
        while (true) {
            const idx = cursor;
            cursor += 1;
            if (idx >= items.length) return;
            out[idx] = await fn(items[idx]);
        }
    });

    await Promise.all(workers);
    return out;
}

function toIsoDate(value: unknown): string {
    if (typeof value !== "string" || value.trim().length === 0) {
        return new Date().toISOString();
    }

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        return new Date().toISOString();
    }

    return d.toISOString();
}

function base64IdFromUrl(url: string): string {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(url, "utf8").toString("base64");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g: any = globalThis as any;
    if (typeof g.btoa === "function") {
        return g.btoa(url);
    }

    return url;
}

function getFirstString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
    if (Array.isArray(value)) {
        for (const item of value) {
            const s = getFirstString(item);
            if (s) return s;
        }
    }
    return undefined;
}

function decodeBasicEntities(input: string): string {
    return input
        .replaceAll("&amp;", "&")
        .replaceAll("&quot;", "\"")
        .replaceAll("&#39;", "'")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">");
}

function extractImageUrl(item: Record<string, unknown>): string | undefined {
    const enclosure = item.enclosure as unknown;
    if (enclosure && typeof enclosure === "object") {
        const url = getFirstString((enclosure as Record<string, unknown>).url);
        if (url) return url;
        const atUrl = getFirstString((enclosure as Record<string, unknown>)["@_url"]);
        if (atUrl) return atUrl;
    }

    const thumbnail = item["media:thumbnail"] as unknown;
    if (thumbnail) {
        if (Array.isArray(thumbnail)) {
            for (const t of thumbnail) {
                if (t && typeof t === "object") {
                    const atUrl = getFirstString((t as Record<string, unknown>)["@_url"]);
                    if (atUrl) return atUrl;
                }
            }
        } else if (typeof thumbnail === "object") {
            const atUrl = getFirstString((thumbnail as Record<string, unknown>)["@_url"]);
            if (atUrl) return atUrl;
        }
    }

    const mediaGroup = item["media:group"] as unknown;
    if (mediaGroup && typeof mediaGroup === "object") {
        const groupContent = (mediaGroup as Record<string, unknown>)["media:content"] as unknown;
        if (groupContent) {
            if (Array.isArray(groupContent)) {
                for (const mc of groupContent) {
                    if (mc && typeof mc === "object") {
                        const atUrl = getFirstString((mc as Record<string, unknown>)["@_url"]);
                        if (atUrl) return atUrl;
                    }
                }
            } else if (typeof groupContent === "object") {
                const atUrl = getFirstString((groupContent as Record<string, unknown>)["@_url"]);
                if (atUrl) return atUrl;
            }
        }
    }

    const media = item["media:content"] as unknown;
    if (media && typeof media === "object") {
        const url = getFirstString((media as Record<string, unknown>).url);
        if (url) return url;
        const atUrl = getFirstString((media as Record<string, unknown>)["@_url"]);
        if (atUrl) return atUrl;
    }

    return undefined;
}

function toUnifiedArticle(input: {
    url?: string;
    title?: string;
    publishedAt: string;
    imageUrl?: string;
    source: string;
    category: string;
}): UnifiedArticle | null {
    const url = input.url?.trim() ?? "";
    const title = input.title?.trim() ?? "";
    if (!url || !title) return null;

    return {
        id: base64IdFromUrl(url),
        sourceType: "rss",
        category: input.category,
        title,
        url,
        source: input.source,
        imageUrl: input.imageUrl,
        publishedAt: input.publishedAt,
    };
}

export async function fetchRssArticles(sources: RssSource[]): Promise<UnifiedArticle[]> {
    const targets = Array.isArray(sources) ? sources : [];
    if (targets.length === 0) return [];

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        processEntities: false,
    });

    const results = await Promise.all(
        targets.map(async (src) => {
            try {
                const res = await fetchTextWithTimeout(src.url, 3000, { next: { revalidate: 300 } });
                if (!res.ok) {
                    throw new Error(`Failed to fetch RSS: ${src.url}`);
                }

                const xml = await readResponseText(res);
                const json = parser.parse(xml) as Record<string, unknown>;

                // RSS 2.0: rss.channel.item
                const channel = (json.rss as Record<string, unknown> | undefined)?.channel as
                    | Record<string, unknown>
                    | undefined;
                const items = (channel?.item as unknown) ?? [];
                const itemArray = Array.isArray(items) ? items : [items];

                const articles: UnifiedArticle[] = [];
                for (const raw of itemArray) {
                    if (!raw || typeof raw !== "object") continue;
                    const item = raw as Record<string, unknown>;

                    const url = (() => {
                        const v = getFirstString(item.link);
                        return v ? decodeBasicEntities(v) : undefined;
                    })();
                    const title = (() => {
                        const v = getFirstString(item.title);
                        return v ? decodeBasicEntities(v) : undefined;
                    })();
                    const publishedAt = toIsoDate(getFirstString(item.pubDate));
                    const imageUrl = (() => {
                        const v = extractImageUrl(item);
                        return v ? decodeBasicEntities(v) : undefined;
                    })();

                    const unified = toUnifiedArticle({
                        url,
                        title,
                        publishedAt,
                        imageUrl,
                        source: src.source,
                        category: src.category,
                    });
                    if (unified) articles.push(unified);
                }

                return articles;
            } catch (err) {
                console.error(`[RSS ERROR] ${src.source}`, err);
                return [];
            }
        }),
    );

    const seen = new Set<string>();
    const merged = results
        .flatMap((r) => r)
        .filter((a) => {
            const key = a.url ?? "";
            if (!key) return false;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const RESOLVE_LIMIT = 6;
    const head = merged.slice(0, RESOLVE_LIMIT);
    const tail = merged.slice(RESOLVE_LIMIT);

    const resolvedHead = await withConcurrencyLimit(
        head,
        4,
        async (article) => {
            const url = article.url ?? "";
            if (!url) return article;
            if (!isGoogleNewsArticleUrl(url)) return article;
            return { ...article, url: await resolveGoogleNewsUrl(url) };
        },
    );

    const mergedResolved = [...resolvedHead, ...tail];

    const ENRICH_LIMIT = 10;
    const toEnrich = mergedResolved.slice(0, ENRICH_LIMIT);
    const rest = mergedResolved.slice(ENRICH_LIMIT);

    const enrichedHead = await withConcurrencyLimit(toEnrich, 4, async (a) => {
        if (a.imageUrl) return a;
        const originalUrl = a.url ?? "";
        if (!originalUrl) return a;

        const resolvedUrl = isGoogleNewsArticleUrl(originalUrl) ? await resolveGoogleNewsUrl(originalUrl) : originalUrl;
        const og = await tryFetchOgImage(resolvedUrl);
        if (!og) return a;
        return { ...a, url: resolvedUrl, imageUrl: og };
    });

    return [...enrichedHead, ...rest];
}
