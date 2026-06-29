export function SkeletonList({ rows = 5 }: { rows?: number }) {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-white/5" />
                    <div className="flex flex-1 flex-col gap-2">
                        <div className="h-3 w-2/3 rounded-full bg-white/5" />
                        <div className="h-2.5 w-1/2 rounded-full bg-white/[0.03]" />
                    </div>
                </div>
            ))}
        </div>
    );
}
