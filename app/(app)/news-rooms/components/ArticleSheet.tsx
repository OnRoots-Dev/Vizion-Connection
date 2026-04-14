"use client";

import Image from "next/image";
import type { UnifiedArticle } from "@/lib/news/types";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

function getRelativeTime(publishedAt: string): string {
    const diff = Date.now() - new Date(publishedAt).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "1時間以内";
    if (hours < 24) return `${hours}時間前`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "昨日";
    return `${days}日前`;
}

export interface ArticleSheetProps {
    article: UnifiedArticle | null;
    onClose: () => void;
}

export default function ArticleSheet({ article, onClose }: ArticleSheetProps) {
    const open = Boolean(article);

    return (
        <Sheet open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
            <SheetContent side="right" className="w-full md:w-[480px] lg:w-[560px]">
                {article ? (
                    <>
                        <SheetHeader>
                            <SheetTitle className="text-lg font-semibold">{article.title}</SheetTitle>
                            <SheetDescription>
                                {`${article.source}  ·  ${getRelativeTime(article.publishedAt)}`}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
                            {article.imageUrl ? (
                                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                                    <Image
                                        src={article.imageUrl}
                                        alt={article.title}
                                        fill
                                        sizes="560px"
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ) : null}

                            {article.body ? (
                                <div className="mt-4 space-y-3 text-sm leading-7 text-foreground">
                                    {article.body.split("\n").map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <SheetFooter className="mt-4">
                            <Button type="button" onClick={onClose}>
                                閉じる
                            </Button>
                        </SheetFooter>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}
