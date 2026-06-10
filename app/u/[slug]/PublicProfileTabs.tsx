"use client";

import { useEffect, useState, type ReactNode } from "react";

type TabId = "profile" | "career" | "schedule";

interface PulseStats {
    journeyCount: number;
    streakDays: number;
    cheerCount: number;
    instandCount: number;
}

function PulseStatItem({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
    return (
        <div
            style={{
                textAlign: "center",
                padding: "12px 8px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
            }}
        >
            <p style={{ margin: 0, fontFamily: "monospace", fontSize: 22, fontWeight: 900, color: "var(--electric)", lineHeight: 1 }}>
                {value.toLocaleString()}{suffix ?? ""}
            </p>
            <p
                style={{
                    margin: "6px 0 0",
                    fontFamily: "monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "var(--muted-foreground)",
                }}
            >
                {label}
            </p>
        </div>
    );
}

export default function PublicProfileTabs({
    roleColor,
    careerLabel,
    profilePanel,
    careerPanel,
    schedulePanel,
    pulseStats,
}: {
    roleColor: string;
    careerLabel: string;
    profilePanel: ReactNode;
    careerPanel: ReactNode;
    schedulePanel: ReactNode;
    pulseStats?: PulseStats;
}) {
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    useEffect(() => {
        const syncTabFromHash = () => {
            const hash = window.location.hash.replace("#", "").toLowerCase();
            if (hash === "schedule") { setActiveTab("schedule"); return; }
            if (hash === "career") { setActiveTab("career"); return; }
            if (hash === "profile") setActiveTab("profile");
        };

        syncTabFromHash();
        window.addEventListener("hashchange", syncTabFromHash);
        return () => window.removeEventListener("hashchange", syncTabFromHash);
    }, []);

    const tabs: { id: TabId; label: string }[] = [
        { id: "profile", label: "Profile" },
        { id: "career", label: careerLabel },
        { id: "schedule", label: "Schedule" },
    ];

    return (
        <section
            className="u4"
            style={{
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#0d0d1a",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 0,
                    padding: 6,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(7,7,14,0.55)",
                }}
            >
                {tabs.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab.id);
                                window.history.replaceState(null, "", `#${tab.id}`);
                            }}
                            style={{
                                minHeight: 46,
                                padding: "0 12px",
                                borderRadius: 14,
                                border: "none",
                                background: active ? `${roleColor}16` : "transparent",
                                color: active ? roleColor : "rgba(255,255,255,0.42)",
                                fontSize: 12,
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                cursor: "pointer",
                                transition: "all 0.18s ease",
                                boxShadow: active ? `inset 0 0 0 1px ${roleColor}24` : "none",
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div style={{ padding: 20 }}>
                {activeTab === "profile" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {pulseStats ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10 }}>
                                <PulseStatItem label="JOURNEY" value={pulseStats.journeyCount} />
                                <PulseStatItem label="STREAK" value={pulseStats.streakDays} suffix="日" />
                                <PulseStatItem label="CHEER" value={pulseStats.cheerCount} />
                                <PulseStatItem label="IN STAND" value={pulseStats.instandCount} />
                            </div>
                        ) : null}
                        {profilePanel}
                    </div>
                ) : null}
                {activeTab === "career" ? careerPanel : null}
                {activeTab === "schedule" ? schedulePanel : null}
            </div>
        </section>
    );
}
