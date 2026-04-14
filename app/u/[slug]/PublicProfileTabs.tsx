"use client";

import { useState, type ReactNode } from "react";

type TabId = "profile" | "career" | "schedule" | "ranking";

export default function PublicProfileTabs({
    roleColor,
    careerLabel,
    profilePanel,
    careerPanel,
    schedulePanel,
    rankingPanel,
}: {
    roleColor: string;
    careerLabel: string;
    profilePanel: ReactNode;
    careerPanel: ReactNode;
    schedulePanel: ReactNode;
    rankingPanel: ReactNode;
}) {
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    const tabs: { id: TabId; label: string }[] = [
        { id: "profile", label: "Profile" },
        { id: "career", label: careerLabel },
        { id: "schedule", label: "Schedule" },
        { id: "ranking", label: "Ranking" },
    ];

    return (
        <section
            className="u4"
            style={{
                borderRadius: 22,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                overflow: "hidden",
                backdropFilter: "blur(14px)",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: 0,
                    padding: 6,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(0,0,0,0.24)",
                }}
            >
                {tabs.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
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
                {activeTab === "profile" ? profilePanel : null}
                {activeTab === "career" ? careerPanel : null}
                {activeTab === "schedule" ? schedulePanel : null}
                {activeTab === "ranking" ? rankingPanel : null}
            </div>
        </section>
    );
}
