import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";
import { env } from "@/lib/env";
import CardPageClient from "./CardPageClient";
import PrivateProfilePage from "@/components/ui/PrivateProfilePage";
import type { UserRole } from "@/features/auth/types";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";

const ROLE_LABEL_JA: Record<UserRole, string> = {
    Athlete: "アスリート", Trainer: "トレーナー", Members: "メンバー", Business: "ビジネス",
};

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const result = await getPublicProfileBySlug(slug);
    if (!result.success) {
        return { title: "Vizion Connection", robots: { index: false, follow: false } };
    }
    const { displayName, role } = result.data;
    return {
        title: `${displayName} (@${slug}) | Vizion Connection`,
        description: `${displayName} は Vizion Connection の ${ROLE_LABEL_JA[role]} です。`,
        openGraph: {
            title: `${displayName} | Vizion Connection`,
            description: `${ROLE_LABEL_JA[role]} として活動中`,
            images: [`${env.NEXT_PUBLIC_BASE_URL}/api/og/${slug}`],
        },
        twitter: {
            card: "summary_large_image",
            images: [`${env.NEXT_PUBLIC_BASE_URL}/api/og/${slug}`],
        },
    };
}

export default async function CardPage({ params }: Props) {
    const { slug } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySession(token) : null;
    const result = await getPublicProfileBySlug(slug, session?.slug ?? null);
    if (!result.success) {
        if (result.reason === "forbidden") {
            return <PrivateProfilePage displayName={slug} />;
        }
        notFound();
    }
    if (result.data.isPublic === false && session?.slug !== slug) {
        return <PrivateProfilePage displayName={result.data.displayName} />;
    }

    const referralUrl = `${env.NEXT_PUBLIC_BASE_URL}/register?ref=${slug}`;
    return (
        <>
            {/* ナビゲーションヘッダー */}
            <header style={{ position: "sticky", top: 0, zIndex: 30, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,7,14,0.95)", backdropFilter: "blur(16px)", padding: "12px 24px" }}>
                <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <a href={`/u/${slug}`} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                            プロフィールへ
                        </a>
                    </div>
                    <a href="/" style={{ display: "flex" }}>
                        <img src="/images/Vizion_Connection_logo-wt.png" alt="Vizion Connection" style={{ height: "26px", width: "auto" }} />
                    </a>
                    <a href="/register" style={{ padding: "6px 14px", borderRadius: "20px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
                        先行登録
                    </a>
                </div>
            </header>
            <CardPageClient profile={result.data} referralUrl={referralUrl} />
        </>
    );
}
