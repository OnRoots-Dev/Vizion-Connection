"use client";

import { useEffect, useState, type ReactNode } from "react";

type TabId = "profile" | "career" | "schedule";

export default function PublicProfileTabs({
    roleColor,
    careerLabel,
    profilePanel,
    careerPanel,
    schedulePanel,
}: {
    roleColor: string;
    careerLabel: string;
    profilePanel: ReactNode;
    careerPanel: ReactNode;
    schedulePanel: ReactNode;
}) {
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    useEffect(() => {
        const syncTabFromHash = () => {
            const hash = window.location.hash.replace("#", "").toLowerCase();
            if (hash === "schedule") {
                setActiveTab("schedule");
                return;
            }
            if (hash === "career") {
                setActiveTab("career");
                return;
            }
            if (hash === "profile") {
                setActiveTab("profile");
            }
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
                {activeTab === "profile" ? profilePanel : null}
                {activeTab === "career" ? careerPanel : null}
                {activeTab === "schedule" ? schedulePanel : null}
            </div>
        </section>
    );
}
