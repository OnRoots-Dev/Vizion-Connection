"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader } from "@/app/(app)/dashboard/components/ui";
import { HubAdPanel } from "@/app/(app)/dashboard/components/HubAdPanel";
import { getHubConfig } from "@/features/hub/config";
import { MembersHubView } from "./MemberHubView";
import { TrainerHubView } from "./TrainerHubView";
import { AthleteHubView } from "./AthleteHubView";
import type { AdItem } from "@/lib/ads-shared";

type BusinessAnalytics = {
    kpis: {
        impressions: number;
        clicks: number;
        conversions: number;
        sales: number;
        ctr: number;
        cvr: number;
    };
    timeline: Array<{
        date: string;
        impressions: number;
        clicks: number;
        conversions: number;
        sales: number;
    }>;
};

type BusinessAd = {
    id: string;
    headline: string;
    bodyText: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
    startsAt: string;
    endsAt: string | null;
    isActive: boolean;
    status?: "pending" | "approved" | "rejected";
    adScope: "regional" | "national" | null;
    prefecture: string | null;
    metrics: {
        clicks: number;
        conversions: number;
    };
};

type BusinessOffer = {
    id: string;
    title: string;
    message: string;
    rewardAmount: number;
    status: "sent" | "approved" | "rejected";
    target: {
        slug: string;
        displayName: string;
        role: string;
    };
    createdAt: string;
    updatedAt: string;
};

type BusinessFeature = "analytics" | "ads" | "offers" | "discovery";

const businessFeatureMeta: Record<BusinessFeature, { title: string; summary: string }> = {
    analytics: { title: "分析", summary: "広告効果と売上の流れを確認" },
    ads: { title: "広告管理", summary: "出稿状況を更新して成果を改善" },
    offers: { title: "オファー", summary: "案件送信と進捗管理を一元化" },
    discovery: { title: "検索", summary: "Athlete・Trainer を検索して候補保存" },
};

const emptyAnalytics: BusinessAnalytics = {
    kpis: { impressions: 0, clicks: 0, conversions: 0, sales: 0, ctr: 0, cvr: 0 },
    timeline: [],
};

const defaultAdForm = {
    headline: "",
    bodyText: "",
    imageUrl: "",
    linkUrl: "",
    prefecture: "",
    startsAt: "",
    endsAt: "",
};

const defaultOfferForm = {
    targetSlug: "",
    title: "",
    message: "",
    rewardAmount: "",
};

const numberFormatter = new Intl.NumberFormat("ja-JP");
const yenFormatter = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
});

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(date);
}

function formatDateTime(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function inputStyle(t: ThemeColors) {
    return {
        width: "100%",
        borderRadius: 12,
        border: `1px solid ${t.border}`,
        background: "rgba(255,255,255,0.04)",
        color: t.text,
        padding: "11px 12px",
        fontSize: 12,
        outline: "none",
    } as const;
}

async function readJson<T>(response: Response): Promise<T> {
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(typeof json?.error === "string" ? json.error : "リクエストに失敗しました");
    }
    return json as T;
}

async function loadBusinessHub() {
    const [analyticsRes, adsRes, offersRes] = await Promise.all([
        fetch("/api/business-hub/analytics", { cache: "no-store" }),
        fetch("/api/business-hub/ads", { cache: "no-store" }),
        fetch("/api/business-hub/offers", { cache: "no-store" }),
    ]);

    const analyticsJson = await readJson<{ analytics: BusinessAnalytics }>(analyticsRes);
    const adsJson = await readJson<{ ads: BusinessAd[] }>(adsRes);
    const offersJson = await readJson<{ offers: BusinessOffer[] }>(offersRes);

    return {
        analytics: analyticsJson.analytics ?? emptyAnalytics,
        ads: adsJson.ads ?? [],
        offers: offersJson.offers ?? [],
    };
}

function GenericHubView({
    profile,
    t,
    roleColor,
    setView,
    ads,
    canManageAdmin,
}: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    ads: AdItem[];
    canManageAdmin: boolean;
}) {
    const hub = getHubConfig(profile.role);
    const accent = hub.accentColor || roleColor;
    const [selectedFeatureId, setSelectedFeatureId] = useState(hub.features[0]?.id ?? "");

    const features = useMemo(() => {
        if (!canManageAdmin || profile.role !== "Business") return hub.features;
        return [
            {
                id: "admin_posts",
                title: "記事管理",
                summary: "運営記事の投稿・編集",
                detail: "運営記事の作成、編集、削除、公開通知の配信を管理できます。",
                actionLabel: "記事管理を開く",
                targetView: "admin_posts" as DashboardView,
            },
            ...hub.features,
        ];
    }, [canManageAdmin, hub.features, profile.role]);

    const selectedFeature = useMemo(
        () => features.find((feature) => feature.id === selectedFeatureId) ?? features[0],
        [features, selectedFeatureId],
    );

    if (!selectedFeature) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title={hub.hubName} sub={hub.purpose} onBack={() => setView("home")} t={t} roleColor={accent} />
            <HubAdPanel ads={ads} t={t} />

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <SectionCard t={t} accentColor={accent}>
                    <div style={{ position: "relative", overflow: "hidden", borderRadius: 18, border: `1px solid ${accent}25`, background: `linear-gradient(135deg, ${accent}16, rgba(255,255,255,0.03))`, padding: 18 }}>
                        <div style={{ position: "absolute", right: -24, top: -24, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${accent}28, transparent 70%)`, pointerEvents: "none" }} />
                        <div style={{ position: "relative" }}>
                            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, fontFamily: "monospace" }}>{hub.accentLabel}</p>
                            <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: t.text }}>{hub.hubName}</h2>
                            <p style={{ margin: "0 0 10px", fontSize: 13, color: t.text, fontWeight: 700 }}>{hub.purpose}</p>
                            <p style={{ margin: 0, fontSize: 11, color: t.sub, lineHeight: 1.8 }}>{hub.summary}</p>
                        </div>
                    </div>
                </SectionCard>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, alignItems: "start" }}>
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <SectionCard t={t} accentColor={accent}>
                        <SLabel text="Hub Menu" color={accent} />
                        <div style={{ display: "grid", gap: 10 }}>
                            {features.map((feature, index) => {
                                const active = selectedFeature.id === feature.id;
                                return (
                                    <button
                                        key={feature.id}
                                        type="button"
                                        onClick={() => {
                                            if (feature.targetView) {
                                                if (feature.targetView === "business") {
                                                    try {
                                                        sessionStorage.setItem("vz-business-feature", feature.id);
                                                    } catch {
                                                    }
                                                }
                                                setView(feature.targetView);
                                                return;
                                            }
                                            setSelectedFeatureId(feature.id);
                                        }}
                                        style={{
                                            width: "100%",
                                            textAlign: "left",
                                            padding: "14px 15px",
                                            borderRadius: 16,
                                            border: `1px solid ${active ? `${accent}45` : t.border}`,
                                            background: active ? `${accent}16` : "rgba(255,255,255,0.03)",
                                            color: t.text,
                                            cursor: "pointer",
                                            position: "relative",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <div style={{ position: "absolute", inset: 0, background: active ? `linear-gradient(135deg, ${accent}12, transparent 60%)` : "transparent", pointerEvents: "none" }} />
                                        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 10 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: 999, background: active ? `${accent}20` : "rgba(255,255,255,0.06)", border: `1px solid ${active ? `${accent}40` : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: active ? accent : t.sub, fontSize: 11, fontWeight: 900, fontFamily: "monospace", flexShrink: 0 }}>
                                                {String(index + 1).padStart(2, "0")}
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: active ? accent : t.text }}>{feature.title}</p>
                                                <p style={{ margin: 0, fontSize: 10, color: t.sub, lineHeight: 1.7 }}>{feature.summary}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </SectionCard>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 }}>
                    <SectionCard t={t} accentColor={accent}>
                        <SLabel text="Feature Detail" color={accent} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div style={{ padding: 18, borderRadius: 18, border: `1px solid ${accent}28`, background: `linear-gradient(145deg, ${accent}14, rgba(255,255,255,0.02))` }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                                    <div>
                                        <p style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900, color: t.text }}>{selectedFeature.title}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: accent, fontWeight: 800 }}>{selectedFeature.summary}</p>
                                    </div>
                                    <span style={{ padding: "4px 10px", borderRadius: 999, border: `1px solid ${accent}35`, background: `${accent}12`, color: accent, fontSize: 10, fontWeight: 800, fontFamily: "monospace" }}>
                                        MAIN FUNCTION
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.9 }}>{selectedFeature.detail}</p>
                            </div>

                            <div style={{ display: "grid", gap: 10 }}>
                                <div style={{ padding: "14px 16px", borderRadius: 16, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.025)" }}>
                                    <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: t.sub, opacity: 0.6, fontFamily: "monospace" }}>How This Drives Value</p>
                                    <p style={{ margin: 0, fontSize: 11, color: t.sub, lineHeight: 1.8 }}>{hub.hubName} は {hub.purpose} を実現するための中核画面です。機能ごとの情報を集約して、次のアクションにつなげやすくします。</p>
                                </div>

                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {selectedFeature.targetView ? (
                                        <button type="button" onClick={() => setView(selectedFeature.targetView!)} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: accent, color: "#061018", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                                            {selectedFeature.actionLabel}
                                        </button>
                                    ) : (
                                        <div style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${accent}25`, background: `${accent}12`, color: accent, fontSize: 12, fontWeight: 800 }}>
                                            {selectedFeature.actionLabel}
                                        </div>
                                    )}
                                    <button type="button" onClick={() => setSelectedFeatureId(hub.features[0].id)} style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.sub, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                        Hubトップに戻る
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                </motion.div>
            </div>
        </div>
    );
}

function AnalyticsChart({ analytics, t, accent }: { analytics: BusinessAnalytics; t: ThemeColors; accent: string }) {
    if (analytics.timeline.length === 0) {
        return <div style={{ padding: 22, borderRadius: 16, border: `1px dashed ${t.border}`, color: t.sub, fontSize: 12 }}>まだ分析データがありません。広告表示やクリックが発生すると、ここに時系列の推移が表示されます。</div>;
    }

    const maxValue = Math.max(1, ...analytics.timeline.flatMap((point) => [point.impressions, point.clicks, point.conversions]));
    const salesMax = Math.max(1, ...analytics.timeline.map((point) => point.sales));

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11, color: t.sub }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 999, background: accent, display: "inline-block" }} />Impression</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 999, background: "#7CEEFF", display: "inline-block" }} />Click</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 999, background: "#7BFFB2", display: "inline-block" }} />Conversion</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 999, background: "#FFD36E", display: "inline-block" }} />Sales</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${analytics.timeline.length}, minmax(42px, 1fr))`, gap: 10, alignItems: "end" }}>
                {analytics.timeline.map((point) => (
                    <div key={point.date} style={{ display: "grid", gap: 8, justifyItems: "center" }}>
                        <div style={{ height: 144, width: "100%", display: "flex", alignItems: "end", justifyContent: "center", gap: 4 }}>
                            <div title={`Imp ${point.impressions}`} style={{ width: 10, height: `${Math.max(8, (point.impressions / maxValue) * 122)}px`, borderRadius: 999, background: accent, boxShadow: `0 0 20px ${accent}33` }} />
                            <div title={`Click ${point.clicks}`} style={{ width: 10, height: `${Math.max(8, (point.clicks / maxValue) * 122)}px`, borderRadius: 999, background: "#7CEEFF" }} />
                            <div title={`CV ${point.conversions}`} style={{ width: 10, height: `${Math.max(8, (point.conversions / maxValue) * 122)}px`, borderRadius: 999, background: "#7BFFB2" }} />
                            <div title={`Sales ${point.sales}`} style={{ width: 10, height: `${Math.max(8, (point.sales / salesMax) * 122)}px`, borderRadius: 999, background: "#FFD36E" }} />
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: t.text, fontWeight: 700 }}>{point.date}</div>
                            <div style={{ fontSize: 9, color: t.sub }}>{numberFormatter.format(point.clicks)} click</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function BusinessHubView({
    profile,
    t,
    roleColor,
    setView,
    ads: hubAds,
}: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    ads: AdItem[];
}) {
    const accent = roleColor || "#3C8CFF";
    const [selectedFeature, setSelectedFeature] = useState<BusinessFeature>("analytics");
    const [analytics, setAnalytics] = useState<BusinessAnalytics>(emptyAnalytics);
    const [ads, setAds] = useState<BusinessAd[]>([]);
    const [offers, setOffers] = useState<BusinessOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savingAd, setSavingAd] = useState(false);
    const [savingOffer, setSavingOffer] = useState(false);
    const [editingAdId, setEditingAdId] = useState<string | null>(null);
    const [adForm, setAdForm] = useState(defaultAdForm);
    const [offerForm, setOfferForm] = useState(defaultOfferForm);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const next = await loadBusinessHub();
            setAnalytics(next.analytics);
            setAds(next.ads);
            setOffers(next.offers);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Business Hubの読み込みに失敗しました");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem("vz-business-feature") as BusinessFeature | null;
            if (stored && stored in businessFeatureMeta) {
                setSelectedFeature(stored);
            }
            sessionStorage.removeItem("vz-business-feature");
        } catch {
        }
    }, []);

    const kpiCards = [
        { label: "Impressions", value: numberFormatter.format(analytics.kpis.impressions), detail: "表示合計" },
        { label: "Clicks", value: numberFormatter.format(analytics.kpis.clicks), detail: "クリック数" },
        { label: "Conversions", value: numberFormatter.format(analytics.kpis.conversions), detail: "CV数" },
        { label: "Sales", value: yenFormatter.format(analytics.kpis.sales), detail: "売上" },
        { label: "CTR", value: `${analytics.kpis.ctr.toFixed(2)}%`, detail: "クリック率" },
        { label: "CVR", value: `${analytics.kpis.cvr.toFixed(2)}%`, detail: "成約率" },
    ];

    const submitAd = async () => {
        setSavingAd(true);
        setError(null);
        try {
            const payload = {
                ...adForm,
                bodyText: adForm.bodyText || null,
                imageUrl: adForm.imageUrl || null,
                linkUrl: adForm.linkUrl || null,
                prefecture: adForm.prefecture || null,
                startsAt: adForm.startsAt || null,
                endsAt: adForm.endsAt || null,
            };
            const endpoint = editingAdId ? `/api/business-hub/ads/${editingAdId}` : "/api/business-hub/ads";
            const method = editingAdId ? "PATCH" : "POST";
            const response = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const json = await readJson<{ ad: BusinessAd }>(response);
            setAds((current) => editingAdId ? current.map((ad) => (ad.id === json.ad.id ? json.ad : ad)) : [json.ad, ...current]);
            setAdForm(defaultAdForm);
            setEditingAdId(null);
            await load();
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "広告を保存できませんでした");
        } finally {
            setSavingAd(false);
        }
    };

    const toggleAd = async (ad: BusinessAd) => {
        setError(null);
        try {
            if (ad.status && ad.status !== "approved") {
                throw new Error("広告は審査中のため、配信状態を変更できません");
            }
            const response = await fetch(`/api/business-hub/ads/${ad.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !ad.isActive }),
            });
            const json = await readJson<{ ad: BusinessAd }>(response);
            setAds((current) => current.map((item) => (item.id === ad.id ? json.ad : item)));
        } catch (toggleError) {
            setError(toggleError instanceof Error ? toggleError.message : "広告ステータスを変更できませんでした");
        }
    };

    const submitOffer = async () => {
        setSavingOffer(true);
        setError(null);
        try {
            const response = await fetch("/api/business-hub/offers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetSlug: offerForm.targetSlug,
                    title: offerForm.title,
                    message: offerForm.message,
                    rewardAmount: Number(offerForm.rewardAmount || 0),
                }),
            });
            const json = await readJson<{ offer: BusinessOffer }>(response);
            setOffers((current) => [json.offer, ...current]);
            setOfferForm(defaultOfferForm);
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "オファーを送信できませんでした");
        } finally {
            setSavingOffer(false);
        }
    };

    const updateOfferStatus = async (offerId: string, status: BusinessOffer["status"]) => {
        setError(null);
        try {
            const response = await fetch(`/api/business-hub/offers/${offerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            const json = await readJson<{ offer: BusinessOffer }>(response);
            setOffers((current) => current.map((offer) => (offer.id === offerId ? json.offer : offer)));
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : "オファーの更新に失敗しました");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Business Hub" sub="売上・広告効果を可視化し、改善につなげる中核画面" onBack={() => setView("home")} t={t} roleColor={accent} />
            <HubAdPanel ads={hubAds} t={t} />

            <SectionCard t={t} accentColor={accent}>
                <div style={{ display: "grid", gap: 8 }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: accent, fontFamily: "monospace" }}>Business Hub</p>
                    <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: t.text }}>{profile.displayName || "Business"} の運用センター</h3>
                    <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.8 }}>実データをもとに、広告配信、成果確認、オファー送信までをこの画面から動かせます。データがない場合も空状態で次のアクションが分かるようにしています。</p>
                </div>
            </SectionCard>

            {error ? <div style={{ padding: "12px 14px", borderRadius: 14, border: "1px solid rgba(255,80,80,0.35)", background: "rgba(255,80,80,0.10)", color: "#ffb6b6", fontSize: 12 }}>{error}</div> : null}

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14, alignItems: "start" }}>
                <SectionCard t={t} accentColor={accent}>
                    <SLabel text="Hub Menu" color={accent} />
                    <div style={{ display: "grid", gap: 10 }}>
                        {(Object.keys(businessFeatureMeta) as BusinessFeature[]).map((key, index) => {
                            const item = businessFeatureMeta[key];
                            const active = selectedFeature === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedFeature(key)}
                                    style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 14, border: `1px solid ${active ? `${accent}55` : t.border}`, background: active ? `${accent}16` : "rgba(255,255,255,0.03)", color: t.text, cursor: "pointer" }}
                                >
                                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        <div style={{ width: 24, height: 24, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: active ? `${accent}22` : "rgba(255,255,255,0.06)", color: active ? accent : t.sub, fontSize: 10, fontWeight: 900, fontFamily: "monospace" }}>{String(index + 1).padStart(2, "0")}</div>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 800, color: active ? accent : t.text, marginBottom: 3 }}>{item.title}</div>
                                            <div style={{ fontSize: 9, color: t.sub, lineHeight: 1.6 }}>{item.summary}</div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: 14, padding: 14, borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.025)", color: t.sub, fontSize: 11, lineHeight: 1.8 }}>
                        プラン: <span style={{ color: t.text, fontWeight: 700 }}>{profile.sponsorPlan ?? "roots"}</span><br />
                        公開中の広告と送信済みオファーは、このメニューからすぐ更新できます。
                    </div>
                </SectionCard>

                <SectionCard t={t} accentColor={accent}>
                    {loading ? (
                        <div style={{ padding: 28, color: t.sub, fontSize: 12 }}>Business Hub を読み込み中...</div>
                    ) : selectedFeature === "analytics" ? (
                        <div style={{ display: "grid", gap: 16 }}>
                            <div>
                                <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: t.text }}>分析</h3>
                                <p style={{ margin: 0, fontSize: 11, color: t.sub }}>インプレッション、クリック、CV、売上を7日単位で確認できます。</p>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                                {kpiCards.map((item) => (
                                    <div key={item.label} style={{ padding: 16, borderRadius: 16, border: `1px solid ${t.border}`, background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))" }}>
                                        <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: t.sub, opacity: 0.8 }}>{item.label}</div>
                                        <div style={{ marginTop: 10, fontSize: 22, fontWeight: 900, color: t.text }}>{item.value}</div>
                                        <div style={{ marginTop: 4, fontSize: 10, color: accent }}>{item.detail}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: 16, borderRadius: 18, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.025)" }}>
                                <SLabel text="Timeline" color={accent} />
                                <AnalyticsChart analytics={analytics} t={t} accent={accent} />
                            </div>
                        </div>
                    ) : selectedFeature === "ads" ? (
                        <div style={{ display: "grid", gap: 16 }}>
                            <div>
                                <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: t.text }}>広告管理</h3>
                                <p style={{ margin: 0, fontSize: 11, color: t.sub }}>広告を作成し、配信状態と成果をリアルタイムの集計値で確認できます。</p>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}><span>見出し</span><input value={adForm.headline} onChange={(e) => setAdForm((current) => ({ ...current, headline: e.target.value }))} style={inputStyle(t)} placeholder="広告の見出し" /></label>
                                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}><span>画像URL</span><input value={adForm.imageUrl} onChange={(e) => setAdForm((current) => ({ ...current, imageUrl: e.target.value }))} style={inputStyle(t)} placeholder="https://..." /></label>
                                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}><span>リンクURL</span><input value={adForm.linkUrl} onChange={(e) => setAdForm((current) => ({ ...current, linkUrl: e.target.value }))} style={inputStyle(t)} placeholder="https://..." /></label>
                                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}><span>都道府県</span><input value={adForm.prefecture} onChange={(e) => setAdForm((current) => ({ ...current, prefecture: e.target.value }))} style={inputStyle(t)} placeholder="東京 など" /></label>
                                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}><span>開始日</span><input type="date" value={adForm.startsAt} onChange={(e) => setAdForm((current) => ({ ...current, startsAt: e.target.value }))} style={inputStyle(t)} /></label>
                                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}><span>終了日</span><input type="date" value={adForm.endsAt} onChange={(e) => setAdForm((current) => ({ ...current, endsAt: e.target.value }))} style={inputStyle(t)} /></label>
                            </div>
                            <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}><span>本文</span><textarea value={adForm.bodyText} onChange={(e) => setAdForm((current) => ({ ...current, bodyText: e.target.value }))} style={{ ...inputStyle(t), minHeight: 96, resize: "vertical" }} placeholder="広告本文" /></label>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button type="button" onClick={() => void submitAd()} disabled={savingAd || !adForm.headline.trim()} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: accent, color: "#07131d", fontWeight: 800, cursor: savingAd ? "progress" : "pointer", opacity: savingAd ? 0.7 : 1 }}>{editingAdId ? "広告を更新" : "新規作成"}</button>
                                {editingAdId ? <button type="button" onClick={() => { setEditingAdId(null); setAdForm(defaultAdForm); }} style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)", color: t.sub, fontWeight: 700, cursor: "pointer" }}>編集をキャンセル</button> : null}
                            </div>
                            <div style={{ display: "grid", gap: 10 }}>
                                {ads.length === 0 ? <div style={{ padding: 20, borderRadius: 16, border: `1px dashed ${t.border}`, color: t.sub, fontSize: 12 }}>まだ広告がありません。最初の広告を作成すると、ここに配信状態と成果が表示されます。</div> : ads.map((ad) => (
                                    <div key={ad.id} style={{ padding: 16, borderRadius: 18, border: `1px solid ${ad.isActive ? `${accent}38` : t.border}`, background: ad.imageUrl ? `linear-gradient(145deg, rgba(5,14,23,0.88), rgba(5,14,23,0.95)), url(${ad.imageUrl}) center / cover` : "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                            <div>
                                                <div style={{ fontSize: 18, fontWeight: 900, color: t.text }}>{ad.headline}</div>
                                                <div style={{ marginTop: 6, fontSize: 11, color: t.sub }}>{ad.bodyText || "本文未設定"}</div>
                                            </div>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                                {ad.status ? (
                                                    <span style={{ padding: "5px 10px", borderRadius: 999, border: `1px solid ${ad.status === "approved" ? "rgba(50,210,120,0.35)" : ad.status === "rejected" ? "rgba(255,107,107,0.35)" : `${accent}45`}`, background: ad.status === "approved" ? "rgba(50,210,120,0.12)" : ad.status === "rejected" ? "rgba(255,107,107,0.12)" : `${accent}12`, color: ad.status === "approved" ? "#7ff0a7" : ad.status === "rejected" ? "#ffb3b3" : accent, fontSize: 10, fontWeight: 800 }}>
                                                        {ad.status === "pending" ? "審査中" : ad.status === "approved" ? "承認" : "却下"}
                                                    </span>
                                                ) : null}
                                                <span style={{ padding: "5px 10px", borderRadius: 999, border: `1px solid ${ad.isActive ? `${accent}45` : t.border}`, background: ad.isActive ? `${accent}14` : "rgba(255,255,255,0.04)", color: ad.isActive ? accent : t.sub, fontSize: 10, fontWeight: 800 }}>{ad.isActive ? "配信中" : "停止中"}</span>
                                                <button type="button" onClick={() => void toggleAd(ad)} disabled={Boolean(ad.status) && ad.status !== "approved"} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, fontSize: 11, fontWeight: 700, cursor: Boolean(ad.status) && ad.status !== "approved" ? "not-allowed" : "pointer", opacity: Boolean(ad.status) && ad.status !== "approved" ? 0.5 : 1 }}>{ad.isActive ? "停止" : "再開"}</button>
                                                <button type="button" onClick={() => { setEditingAdId(ad.id); setAdForm({ headline: ad.headline, bodyText: ad.bodyText ?? "", imageUrl: ad.imageUrl ?? "", linkUrl: ad.linkUrl ?? "", prefecture: ad.prefecture ?? "", startsAt: ad.startsAt.slice(0, 10), endsAt: ad.endsAt ? ad.endsAt.slice(0, 10) : "" }); }} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.04)", color: t.text, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>編集</button>
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginTop: 14 }}>
                                            <div style={{ padding: 12, borderRadius: 14, background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: 10, color: t.sub }}>期間</div><div style={{ marginTop: 4, fontSize: 12, color: t.text, fontWeight: 700 }}>{formatDate(ad.startsAt)} - {ad.endsAt ? formatDate(ad.endsAt) : "期限なし"}</div></div>
                                            <div style={{ padding: 12, borderRadius: 14, background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: 10, color: t.sub }}>クリック</div><div style={{ marginTop: 4, fontSize: 18, color: t.text, fontWeight: 900 }}>{numberFormatter.format(ad.metrics.clicks)}</div></div>
                                            <div style={{ padding: 12, borderRadius: 14, background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: 10, color: t.sub }}>CV</div><div style={{ marginTop: 4, fontSize: 18, color: t.text, fontWeight: 900 }}>{numberFormatter.format(ad.metrics.conversions)}</div></div>
                                            <div style={{ padding: 12, borderRadius: 14, background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.08)" }}><div style={{ fontSize: 10, color: t.sub }}>配信範囲</div><div style={{ marginTop: 4, fontSize: 12, color: t.text, fontWeight: 700 }}>{ad.adScope === "national" ? "全国" : "地域"}{ad.prefecture ? ` / ${ad.prefecture}` : ""}</div></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : selectedFeature === "discovery" ? (
                        <div style={{ display: "grid", gap: 16 }}>
                            <div>
                                <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: t.text }}>Athlete・Trainer検索</h3>
                                <p style={{ margin: 0, fontSize: 11, color: t.sub }}>Discovery と同様の検索機能で候補を探し、プロフィールを比較できます。</p>
                            </div>
                            <div style={{ padding: 16, borderRadius: 18, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.025)" }}>
                                <SLabel text="Discovery" color={accent} />
                                <p style={{ margin: "10px 0 0", fontSize: 12, color: t.sub, lineHeight: 1.9 }}>
                                    競技・地域・ロールなどで絞り込みながら候補を探し、気になる相手はコレクトして一時保存しておく運用ができます。
                                </p>
                                <div style={{ marginTop: 14 }}>
                                    <button
                                        type="button"
                                        onClick={() => setView("discovery")}
                                        style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: accent, color: "#07131d", fontWeight: 800, cursor: "pointer" }}
                                    >
                                        Discoveryを開く
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: 16 }}>
                            <div>
                                <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: t.text }}>オファー</h3>
                                <p style={{ margin: 0, fontSize: 11, color: t.sub }}>送信済み案件の進捗を確認しながら、新しいオファーを作成できます。</p>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}><span>対象ユーザーの slug</span><input value={offerForm.targetSlug} onChange={(e) => setOfferForm((current) => ({ ...current, targetSlug: e.target.value }))} style={inputStyle(t)} placeholder="athlete_01" /></label>
                                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}><span>タイトル</span><input value={offerForm.title} onChange={(e) => setOfferForm((current) => ({ ...current, title: e.target.value }))} style={inputStyle(t)} placeholder="イベント出演のご相談" /></label>
                                <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}><span>報酬 (円)</span><input type="number" min="0" value={offerForm.rewardAmount} onChange={(e) => setOfferForm((current) => ({ ...current, rewardAmount: e.target.value }))} style={inputStyle(t)} placeholder="50000" /></label>
                            </div>
                            <label style={{ display: "grid", gap: 6, fontSize: 11, color: t.sub }}><span>メッセージ</span><textarea value={offerForm.message} onChange={(e) => setOfferForm((current) => ({ ...current, message: e.target.value }))} style={{ ...inputStyle(t), minHeight: 110, resize: "vertical" }} placeholder="ご依頼内容を記載してください" /></label>
                            <div><button type="button" onClick={() => void submitOffer()} disabled={savingOffer || !offerForm.targetSlug.trim() || !offerForm.title.trim() || !offerForm.message.trim()} style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: accent, color: "#07131d", fontWeight: 800, cursor: savingOffer ? "progress" : "pointer", opacity: savingOffer ? 0.7 : 1 }}>新規オファー送信</button></div>
                            <div style={{ display: "grid", gap: 10 }}>
                                {offers.length === 0 ? <div style={{ padding: 20, borderRadius: 16, border: `1px dashed ${t.border}`, color: t.sub, fontSize: 12 }}>まだ送信済みオファーがありません。候補ユーザーへ最初の案件を送ると、ここで進捗を管理できます。</div> : offers.map((offer) => (
                                    <div key={offer.id} style={{ padding: 16, borderRadius: 18, border: `1px solid ${t.border}`, background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                            <div>
                                                <div style={{ fontSize: 17, fontWeight: 900, color: t.text }}>{offer.title}</div>
                                                <div style={{ marginTop: 4, fontSize: 11, color: t.sub }}>対象: {offer.target.displayName} @{offer.target.slug} / {offer.target.role}</div>
                                            </div>
                                            <span style={{ padding: "5px 10px", borderRadius: 999, border: `1px solid ${offer.status === "approved" ? "#32D27855" : offer.status === "rejected" ? "#ff757555" : `${accent}45`}`, background: offer.status === "approved" ? "rgba(50,210,120,0.12)" : offer.status === "rejected" ? "rgba(255,80,80,0.12)" : `${accent}12`, color: offer.status === "approved" ? "#7ff0a7" : offer.status === "rejected" ? "#ffb3b3" : accent, fontSize: 10, fontWeight: 800 }}>{offer.status === "sent" ? "送信中" : offer.status === "approved" ? "承認" : "拒否"}</span>
                                        </div>
                                        <p style={{ margin: "10px 0 0", fontSize: 12, color: t.sub, lineHeight: 1.8 }}>{offer.message}</p>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 14 }}>
                                            <div style={{ padding: 12, borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}><div style={{ fontSize: 10, color: t.sub }}>報酬条件</div><div style={{ marginTop: 4, fontSize: 16, fontWeight: 900, color: t.text }}>{yenFormatter.format(offer.rewardAmount)}</div></div>
                                            <div style={{ padding: 12, borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}><div style={{ fontSize: 10, color: t.sub }}>送信日時</div><div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: t.text }}>{formatDateTime(offer.createdAt)}</div></div>
                                            <div style={{ padding: 12, borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.03)" }}><div style={{ fontSize: 10, color: t.sub }}>最終更新</div><div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: t.text }}>{formatDateTime(offer.updatedAt)}</div></div>
                                        </div>
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                                            {(["sent", "approved", "rejected"] as const).map((status) => (
                                                <button key={status} type="button" onClick={() => void updateOfferStatus(offer.id, status)} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${offer.status === status ? `${accent}45` : t.border}`, background: offer.status === status ? `${accent}14` : "rgba(255,255,255,0.03)", color: offer.status === status ? accent : t.sub, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{status === "sent" ? "送信中" : status === "approved" ? "承認" : "拒否"}</button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    );
}

export function BusinessView({
    profile,
    referralUrl,
    t,
    roleColor,
    setView,
    ads,
    canManageAdmin = false,
}: {
    profile: ProfileData;
    referralUrl?: string;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    onProfilePatch?: (patch: Partial<ProfileData>) => void;
    ads: AdItem[];
    canManageAdmin?: boolean;
}) {
    if (profile.role === "Business") {
        return <BusinessHubView profile={profile} t={t} roleColor={roleColor} setView={setView} ads={ads} />;
    }

    if (profile.role === "Members") {
        return <MembersHubView profile={profile} referralUrl={referralUrl ?? ""} t={t} roleColor={roleColor} setView={setView} ads={ads} />;
    }

    if (profile.role === "Trainer") {
        return <GenericHubView profile={profile} t={t} roleColor={roleColor} setView={setView} ads={ads} canManageAdmin={canManageAdmin} />;
    }

    if (profile.role === "Athlete") {
        return <AthleteHubView profile={profile} t={t} roleColor={roleColor} setView={setView} ads={ads} />;
    }

    return <GenericHubView profile={profile} t={t} roleColor={roleColor} setView={setView} ads={ads} canManageAdmin={canManageAdmin} />;
}
