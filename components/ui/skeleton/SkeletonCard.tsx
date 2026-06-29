export function SkeletonCard({ height = 120 }: { height?: number }) {
    return (
        <div
            className="animate-pulse rounded-[14px] bg-white/5"
            style={{ height }}
        />
    );
}
