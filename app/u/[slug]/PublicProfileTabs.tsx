"use client";

import { useEffect, useState, type ReactNode } from "react";
import { INTERACTION } from "@/lib/design/tokens";
import { User, Briefcase } from "lucide-react";

type TabId = "profile" | "career";

export default function PublicProfileTabs({
    roleColor,
    careerLabel,
    profilePanel,
    careerPanel,
}: {
    roleColor: string;
    careerLabel: string;
    profilePanel: ReactNode;
    careerPanel: ReactNode;
}) {
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    useEffect(() => {
        const syncTabFromHash = () => {
            const hash = window.location.hash.replace("#", "").toLowerCase();
            if (hash === "career") { setActiveTab("career"); return; }
            if (hash === "profile") setActiveTab("profile");
        };

        syncTabFromHash();
        window.addEventListener("hashchange", syncTabFromHash);
        return () => window.removeEventListener("hashchange", syncTabFromHash);
    }, []);

    const tabs: { id: TabId; label: string; icon: any }[] = [
        { id: "profile", label: "Profile", icon: User },
        { id: "career", label: careerLabel, icon: Briefcase },
    ];

    return (
        <section
            className="u4"
            style={{
                borderRadius: INTERACTION.radius.card,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "#0d0d1a",
                boxShadow: INTERACTION.hover.shadow.rest,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 0,
                    padding: 6,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(7,7,14,0.55)",
                }}
            >
                {tabs.map((tab) => {
                    const active = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab.id);
                                window.history.replaceState(null, "", `#${tab.id}`);
                            }}
                            style={{
                                minHeight: 48,
                                padding: "0 12px",
                                borderRadius: 14,
                                border: "none",
                                background: active ? `${roleColor}16` : "transparent",
                                color: active ? roleColor : "rgba(255,255,255,0.42)",
                                fontSize: 13,
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                cursor: "pointer",
                                transition: "all 0.18s ease",
                                boxShadow: active ? `inset 0 0 0 1px ${roleColor}24` : "none",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div style={{ padding: 20 }}>
                {activeTab === "profile" ? profilePanel : null}
                {activeTab === "career" ? careerPanel : null}
            </div>
        </section>
    );
}
