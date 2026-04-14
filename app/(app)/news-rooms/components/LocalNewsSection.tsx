import NewsCard from "./NewsCard";
import NewsCardSkeleton from "./NewsCardSkeleton";
import NewsSectionHeader from "./NewsSectionHeader";
import type { UnifiedArticle } from "@/lib/news/types";

export default function LocalNewsSection({
    title,
    articles,
    loading,
    error,
    onRetry,
}: {
    title: string;
    articles: UnifiedArticle[];
    loading: boolean;
    error: boolean;
    onRetry: () => void;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <NewsSectionHeader title={title} />

            {loading ? (
                <div className="animate-pulse">
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className={idx === 4 ? "" : "border-b border-white/10"}>
                            <NewsCardSkeleton />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="px-5 py-5">
                    <p className="text-sm text-white/70">ニュースを取得できませんでした</p>
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-3 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                        再試行
                    </button>
                </div>
            ) : (
                <div>
                    {articles.slice(0, 5).map((article, idx, arr) => (
                        <NewsCard key={article.id} article={article} showDivider={idx !== arr.length - 1} />
                    ))}
                </div>
            )}
        </section>
    );
}
