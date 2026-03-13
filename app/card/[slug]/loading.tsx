// app/card/[slug]/loading.tsx

export default function CardLoading() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <div
                className="w-80 h-48 rounded-2xl bg-[#111] border border-[#1e1e1e] animate-pulse"
            />
        </div>
    );
}