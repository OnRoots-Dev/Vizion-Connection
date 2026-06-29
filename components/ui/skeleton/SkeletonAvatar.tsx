export function SkeletonAvatar({ size = 44 }: { size?: number }) {
    return (
        <div
            className="animate-pulse shrink-0 rounded-full bg-white/5"
            style={{ width: size, height: size }}
        />
    );
}
