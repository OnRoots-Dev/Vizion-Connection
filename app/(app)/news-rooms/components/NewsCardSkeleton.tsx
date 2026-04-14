export default function NewsCardSkeleton() {
    return (
        <div className="flex items-center gap-4 px-5 py-3 md:py-4">
            <div className="min-w-0 flex-1">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="mt-2 h-4 w-full rounded bg-muted" />
                <div className="mt-2 h-3 w-20 rounded bg-muted" />
            </div>

            <div className="h-14 w-18 shrink-0 rounded-md bg-muted md:h-18 md:w-24" />
        </div>
    );
}
