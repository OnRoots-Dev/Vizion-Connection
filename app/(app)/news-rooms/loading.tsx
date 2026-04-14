import NewsCardSkeleton from "@/app/(app)/news-rooms/components/NewsCardSkeleton";

export default function Loading() {
    return (
        <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
            <div className="mx-auto w-full max-w-4xl space-y-5">
                <div className="space-y-4">
                    <div className="flex items-end justify-between gap-4">
                        <div className="h-10 w-56 animate-pulse rounded-xl bg-muted" />
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    </div>

                    <div className="flex gap-2 overflow-x-auto">
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <div key={idx} className="h-9 w-24 animate-pulse rounded-full bg-muted" />
                        ))}
                    </div>

                    {Array.from({ length: 2 }).map((_, sectionIdx) => (
                        <section key={sectionIdx} className="overflow-hidden rounded-2xl border bg-card">
                            <div className="border-b px-5 py-4">
                                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                            </div>
                            <div>
                                {Array.from({ length: 4 }).map((__, rowIdx) => (
                                    <div key={rowIdx} className={rowIdx === 3 ? "" : "border-b"}>
                                        <NewsCardSkeleton />
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}
