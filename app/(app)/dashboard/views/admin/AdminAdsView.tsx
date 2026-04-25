"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";

type AdminAdRow = {
    id: string;
    business_id: number | null;
    headline: string | null;
    body_text: string | null;
    image_url: string | null;
    link_url: string | null;
    is_active: boolean;
    status: "pending" | "approved" | "rejected" | null;
    ad_scope: string | null;
    region: string | null;
    prefecture: string | null;
    sport_category: string | null;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string | null;
    position: number | null;
};

function formatDate(value: string | null) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

function statusLabel(status: AdminAdRow["status"]) {
    if (status === "pending") return "審査中";
    if (status === "approved") return "承認";
    if (status === "rejected") return "却下";
    return "-";
}

export default function AdminAdsView({
    t,
    roleColor,
    setView,
}: {
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}) {
    const [ads, setAds] = useState<AdminAdRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
    const [savingId, setSavingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/ads", { cache: "no-store" });
            const json = (await res.json()) as { ads?: AdminAdRow[]; error?: string };
            if (!res.ok) {
                throw new Error(json.error ?? "広告一覧の取得に失敗しました");
            }
            setAds(Array.isArray(json.ads) ? json.ads : []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "広告一覧の取得に失敗しました");
            setAds([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const rows = useMemo(() => {
        if (filter === "all") return ads;
        return ads.filter((ad) => ad.status === filter);
    }, [ads, filter]);

    const patchAd = useCallback(async (id: string, patch: { status?: "pending" | "approved" | "rejected"; isActive?: boolean }) => {
        setSavingId(id);
        setError("");
        try {
            const res = await fetch(`/api/admin/ads/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch),
            });
            const json = (await res.json()) as { ad?: AdminAdRow; error?: string };
            if (!res.ok || !json.ad) {
                throw new Error(json.error ?? "更新に失敗しました");
            }
            setAds((current) => current.map((item) => (item.id === id ? json.ad! : item)));
        } catch (e) {
            setError(e instanceof Error ? e.message : "更新に失敗しました");
        } finally {
            setSavingId(null);
        }
    }, []);

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <ViewHeader title="広告審査" sub="申請された広告の審査 / 承認 / 却下" onBack={() => setView("hub")} t={t} roleColor={roleColor} />

            <SectionCard t={t} accentColor={roleColor}>
                <SLabel text="Filters" color={roleColor} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {([
                        ["pending", "審査中"],
                        ["approved", "承認"],
                        ["rejected", "却下"],
                        ["all", "すべて"],
                    ] as const).map(([key, label]) => {
                        const active = filter === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setFilter(key)}
                                style={{
                                    border: `1px solid ${active ? `${roleColor}55` : t.border}`,
                                    background: active ? `${roleColor}14` : "rgba(255,255,255,0.03)",
                                    color: active ? roleColor : t.sub,
                                    borderRadius: 999,
                                    padding: "7px 12px",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={() => void load()}
                        style={{
                            marginLeft: "auto",
                            border: `1px solid ${t.border}`,
                            background: "transparent",
                            color: t.text,
                            borderRadius: 10,
                            padding: "7px 12px",
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: "pointer",
                        }}
                    >
                        更新
                    </button>
                </div>
                {error ? <p style={{ margin: "10px 0 0", fontSize: 12, color: "#ff6b6b" }}>{error}</p> : null}
            </SectionCard>

            <SectionCard t={t}>
                <SLabel text="Ads" color={roleColor} />

                {loading ? (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>読み込み中...</p>
                ) : rows.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub }}>対象の広告がありません。</p>
                ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                        {rows.map((ad) => {
                            const busy = savingId === ad.id;
                            return (
                                <div
                                    key={ad.id}
                                    style={{
                                        padding: 14,
                                        borderRadius: 14,
                                        border: `1px solid ${t.border}`,
                                        background: "rgba(255,255,255,0.02)",
                                        display: "grid",
                                        gap: 10,
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {ad.headline ?? "(no headline)"}
                                            </p>
                                            <p style={{ margin: "6px 0 0", fontSize: 11, color: t.sub }}>
                                                {statusLabel(ad.status)} · {ad.is_active ? "配信中" : "停止中"} · {formatDate(ad.created_at)}
                                            </p>
                                            <p style={{ margin: "6px 0 0", fontSize: 10, color: t.sub, opacity: 0.8 }}>
                                                {ad.link_url ?? "(no link)"}
                                            </p>
                                        </div>

                                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => void patchAd(ad.id, { status: "approved", isActive: true })}
                                                style={{
                                                    border: "1px solid rgba(50,210,120,0.35)",
                                                    background: "rgba(50,210,120,0.12)",
                                                    color: "#7ff0a7",
                                                    borderRadius: 10,
                                                    padding: "8px 12px",
                                                    fontSize: 11,
                                                    fontWeight: 900,
                                                    cursor: busy ? "not-allowed" : "pointer",
                                                    opacity: busy ? 0.6 : 1,
                                                }}
                                            >
                                                承認
                                            </button>
                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => void patchAd(ad.id, { status: "rejected", isActive: false })}
                                                style={{
                                                    border: "1px solid rgba(255,107,107,0.4)",
                                                    background: "rgba(255,107,107,0.10)",
                                                    color: "#ffb6b6",
                                                    borderRadius: 10,
                                                    padding: "8px 12px",
                                                    fontSize: 11,
                                                    fontWeight: 900,
                                                    cursor: busy ? "not-allowed" : "pointer",
                                                    opacity: busy ? 0.6 : 1,
                                                }}
                                            >
                                                却下
                                            </button>
                                            <button
                                                type="button"
                                                disabled={busy || ad.status !== "approved"}
                                                onClick={() => void patchAd(ad.id, { isActive: !ad.is_active })}
                                                style={{
                                                    border: `1px solid ${t.border}`,
                                                    background: "rgba(255,255,255,0.04)",
                                                    color: t.text,
                                                    borderRadius: 10,
                                                    padding: "8px 12px",
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                    cursor: busy || ad.status !== "approved" ? "not-allowed" : "pointer",
                                                    opacity: busy || ad.status !== "approved" ? 0.5 : 1,
                                                }}
                                            >
                                                {ad.is_active ? "停止" : "再開"}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                                        <div style={{ padding: 10, borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.02)" }}>
                                            <div style={{ fontSize: 10, color: t.sub }}>配信範囲</div>
                                            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: t.text }}>{ad.ad_scope ?? "-"}{ad.prefecture ? ` / ${ad.prefecture}` : ""}</div>
                                        </div>
                                        <div style={{ padding: 10, borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.02)" }}>
                                            <div style={{ fontSize: 10, color: t.sub }}>期間</div>
                                            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: t.text }}>{formatDate(ad.starts_at)} - {formatDate(ad.ends_at)}</div>
                                        </div>
                                        <div style={{ padding: 10, borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.02)" }}>
                                            <div style={{ fontSize: 10, color: t.sub }}>Position</div>
                                            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: t.text }}>{ad.position ?? 3}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}
