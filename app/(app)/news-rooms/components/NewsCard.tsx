import Image from "next/image";
import type { UnifiedArticle } from "@/lib/news/types";

export interface NewsCardProps {
    article: UnifiedArticle;
    onClick?: () => void;
    showDivider?: boolean;
}

function getRelativeTime(publishedAt: string): string {
    const diff = Date.now() - new Date(publishedAt).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "1時間以内";
    if (hours < 24) return `${hours}時間前`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "昨日";
    return `${days}日前`;
}

export default function NewsCard({ article, onClick, showDivider = true }: NewsCardProps) {
    const body = (
        <div className="flex items-center gap-4 px-5 py-3 md:py-4">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {article.category}
                    </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-foreground">
                    {article.title}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                    {article.source} · {getRelativeTime(article.publishedAt)}
                </p>
            </div>

            {article.imageUrl ? (
                <div className="relative h-14 w-18 shrink-0 overflow-hidden rounded-md bg-muted md:h-18 md:w-24">
                    <Image
                        unoptimized
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className="h-14 w-18 shrink-0 rounded-md bg-muted md:h-18 md:w-24" />
            )}
        </div>
    );

    const commonClass = `block transition-colors hover:bg-muted/40 ${showDivider ? "border-b" : ""}`;

    if (article.sourceType === "rss") {
        return (
            <a href={article.url} target="_blank" rel="noopener noreferrer" className={commonClass}>
                {body}
            </a>
        );
    }

    if (!onClick) {
        return <div className={commonClass}>{body}</div>;
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    onClick?.();
                }
            }}
            className={commonClass}
        >
            {body}
        </div>
    );
}
