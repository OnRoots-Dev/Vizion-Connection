"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { OnboardingStepBar } from "../OnboardingStepBar";

type DiscoveryUser = {
    slug: string;
    display_name: string;
    role: string;
    avatar_url?: string | null;
    cheer_count: number;
    region?: string | null;
    sport?: string | null;
};

const ROLE_COLORS: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Crew: "#FFC81E", Business: "#3C8CFF",
};

const T = {
    surface: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)",
    text: "#F0F0F5", sub: "rgba(255,255,255,0.45)",
};

export default function DiscoveryOnboardingClient() {
    const router = useRouter();
    const [users, setUsers] = useState<DiscoveryUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [cheering, setCheering] = useState<string | null>(null);
    const [cheeredSlugs, setCheeredSlugs] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetch("/api/discovery/users?limit=8", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => setUsers(Array.isArray(d?.users) ? d.users : []))
            .catch(() => setUsers([]))
            .finally(() => setLoading(false));
    }, []);

    async function handleCheer(slug: string) {
        if (cheering || cheeredSlugs.has(slug)) return;
        setCheering(slug);
        try {
            const res = await fetch("/api/cheers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toSlug: slug, comment: "" }),
            });
            if (res.ok) {
                setCheeredSlugs((prev) => new Set(prev).add(slug));
                setTimeout(() => router.push("/onboarding/invite"), 800);
            }
        } catch {
            // ignore
        } finally {
            setCheering(null);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ minHeight: "100vh", background: "#0B0B0F", paddingBottom: 40 }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px 0" }}>
                <OnboardingStepBar current={4} />
                <button
                    type="button"
                    onClick={() => router.push("/onboarding/invite")}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer", padding: "4px 8px", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                    後にする
                </button>
            </div>

            <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px 0" }}>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(255,214,0,0.08)", border: "1px solid rgba(255,214,0,0.2)", marginBottom: 24, textAlign: "center" }}
                >
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#FFD600" }}>
                        ⚡ 気になるユーザーにCheerを送ってみましょう。
                    </p>
                </motion.div>

                {loading ? (
                    <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 40 }}>読み込み中...</p>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>表示できるユーザーがいません</p>
                        <button
                            type="button"
                            onClick={() => router.push("/onboarding/invite")}
                            style={{ marginTop: 16, padding: "12px 24px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.55)", fontSize: 13, cursor: "pointer" }}
                        >
                            次へ進む
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {users.map((user, i) => {
                            const roleColor = ROLE_COLORS[user.role] ?? "#a78bfa";
                            const isCheered = cheeredSlugs.has(user.slug);
                            const isSending = cheering === user.slug;
                            const initials = user.display_name.slice(0, 2).toUpperCase();
                            return (
                                <motion.div
                                    key={user.slug}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05, duration: 0.3 }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                                        borderRadius: 16, border: `1px solid ${isCheered ? `${roleColor}35` : T.border}`,
                                        background: isCheered ? `${roleColor}08` : T.surface,
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    <div style={{
                                        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                                        background: `${roleColor}22`, border: `1px solid ${roleColor}35`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden",
                                    }}>
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <span style={{ fontSize: 14, fontWeight: 900, color: roleColor }}>{initials}</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {user.display_name}
                                        </p>
                                        <p style={{ margin: "3px 0 0", fontSize: 10, color: roleColor, fontFamily: "monospace", fontWeight: 700 }}>
                                            {user.role}{user.sport ? ` · ${user.sport}` : ""}{user.region ? ` · ${user.region}` : ""}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => void handleCheer(user.slug)}
                                        disabled={isCheered || isSending || cheering !== null}
                                        style={{
                                            flexShrink: 0, padding: "8px 14px", borderRadius: 20,
                                            border: `1px solid ${isCheered ? `${roleColor}40` : "rgba(255,214,0,0.3)"}`,
                                            background: isCheered ? `${roleColor}18` : "rgba(255,214,0,0.1)",
                                            color: isCheered ? roleColor : "#FFD600",
                                            fontSize: 11, fontWeight: 900, cursor: isCheered ? "default" : "pointer",
                                            opacity: (isSending || (cheering !== null && !isCheered)) ? 0.5 : 1,
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        {isCheered ? "✓ Cheered" : isSending ? "..." : "⚡ Cheer"}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
