export function SkeletonText({ lines = 3 }: { lines?: number }) {
    const widths = ["w-full", "w-4/5", "w-3/5", "w-2/3", "w-1/2"];
    return (
        <div className="flex flex-col gap-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`animate-pulse h-3 rounded-full bg-white/5 ${widths[i % widths.length]}`}
                />
            ))}
        </div>
    );
}
