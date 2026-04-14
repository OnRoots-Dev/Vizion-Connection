import { unstable_cache } from "next/cache";
import { fetchRssArticles } from "@/lib/news/rss";
import { buildKeywords } from "@/lib/news/personalize";
import type { UnifiedArticle } from "@/lib/news/types";

const FEED_BASE = "https://news.google.com/rss/search?hl=ja&gl=JP&ceid=JP:ja";

function toFeedUrl(keyword: string) {
  return `${FEED_BASE}&q=${encodeURIComponent(keyword)}`;
}

const getCachedFeedByKeyword = unstable_cache(
  async (keyword: string) => {
    if (!keyword.trim()) return [] as UnifiedArticle[];
    return fetchRssArticles([{ url: toFeedUrl(keyword), source: "Google News", category: "feed" }]);
  },
  ["news-feed-by-keyword"],
  { revalidate: 300 },
);

const getCachedTopSections = unstable_cache(
  async (role: string, sport: string, sportsCategory: string) => {
    const sections = buildKeywords({
      role,
      sport: sport || null,
      sports_category: sportsCategory || null,
    });

    const results = await Promise.allSettled(
      sections.map(async (section) => ({
        section,
        articles: await getCachedFeedByKeyword(section.keyword),
      })),
    );

    return results
      .filter(
        (result): result is PromiseFulfilledResult<{ section: (typeof sections)[0]; articles: UnifiedArticle[] }> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);
  },
  ["news-top-sections"],
  { revalidate: 300 },
);

const getCachedLocalNews = unstable_cache(
  async (prefecture: string, region: string) => {
    const q = prefecture.trim() || region.trim();
    if (!q) return [] as UnifiedArticle[];
    const articles = await fetchRssArticles([{ url: toFeedUrl(q), source: "Google News", category: "local" }]);
    return articles.slice(0, 20);
  },
  ["news-local"],
  { revalidate: 300 },
);

export async function getFeedByKeyword(keyword: string) {
  return getCachedFeedByKeyword(keyword.trim());
}

export async function getTopFeedSections(input: {
  role: string;
  sport?: string | null;
  sportsCategory?: string | null;
}) {
  const role = input.role.trim();
  const sport = input.sport?.trim() ?? "";
  const sportsCategory = input.sportsCategory?.trim() ?? "";

  if (!role) {
    const articles = await getCachedFeedByKeyword("スポーツ");
    return [{ section: { label: "スポーツのニュース", keyword: "スポーツ" }, articles }];
  }

  return getCachedTopSections(role, sport, sportsCategory);
}

export async function getLocalFeed(prefecture: string, region: string) {
  return getCachedLocalNews(prefecture.trim(), region.trim());
}
