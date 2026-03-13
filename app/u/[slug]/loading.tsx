// app/u/[slug]/loading.tsx

export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div className="w-full max-w-lg mx-auto px-6 py-16 space-y-8 animate-pulse">
                {/* Avatar skeleton */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-[#1a1a1a]" />
                    <div className="h-6 w-40 rounded-lg bg-[#1a1a1a]" />
                    <div className="h-4 w-24 rounded-lg bg-[#1a1a1a]" />
                </div>
                {/* Stats skeleton */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 rounded-xl bg-[#111]" />
                    <div className="h-20 rounded-xl bg-[#111]" />
                </div>
                {/* Button skeleton */}
                <div className="h-12 rounded-xl bg-[#111]" />
            </div>
        </div>
    );
}