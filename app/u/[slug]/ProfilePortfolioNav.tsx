// 公開ページ共通の Profile ⇄ Portfolio トグル。
// /u/[slug]（Profile）と /u/[slug]/portfolio（Portfolio）の双方ヘッダーで使用し、
// どちらにいても相互に回遊できるようにする。純粋なリンクのみ（クライアント不要）。

import Link from "next/link";

export function ProfilePortfolioNav({
    slug,
    active,
    accent,
}: {
    slug: string;
    active: "profile" | "portfolio";
    accent: string;
}) {
    const pill = (label: string, href: string, isActive: boolean) => (
        <Link
            href={href}
            aria-current={isActive ? "page" : undefined}
            style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                border: `1px solid ${isActive ? `${accent}66` : "rgba(255,255,255,0.10)"}`,
                background: isActive ? `${accent}1f` : "rgba(255,255,255,0.03)",
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </Link>
    );

    return (
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {pill("Profile", `/u/${slug}`, active === "profile")}
            {pill("Portfolio", `/u/${slug}/portfolio`, active === "portfolio")}
        </div>
    );
}
