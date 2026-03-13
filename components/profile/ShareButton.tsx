// components/ShareButton.tsx
"use client";

export default function ShareButton({ url, text }: { url: string; text: string }) {
    const handle = () => {
        const intent = new URL("https://twitter.com/intent/tweet");
        intent.searchParams.set("url", url);
        intent.searchParams.set("text", text);
        window.open(intent.toString(), "_blank", "noopener,noreferrer");
    };

    return (
        <button
            onClick={handle}
            className="rounded-full bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-sky-300 active:translate-y-[1px]"
        >
            X で共有
        </button>
    );
}
