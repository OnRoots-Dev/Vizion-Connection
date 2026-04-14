export default function NewsSectionHeader({ title }: { title: string }) {
    return (
        <div className="flex items-end justify-between gap-3 border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-black tracking-tight text-white">{title}</h2>
        </div>
    );
}
