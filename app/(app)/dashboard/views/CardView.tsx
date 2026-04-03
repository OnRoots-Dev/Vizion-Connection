"use client";

import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import { ViewHeader } from "@/app/(app)/dashboard/components/ui";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";

export function CardView({ profile, t, roleColor, setView }: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Profile Card" sub="あなたのVizionカード" onBack={() => setView("home")} t={t} roleColor={roleColor} />
            <ProfileCardSection profile={profile} t={t} roleColor={roleColor} setView={setView} />
        </div>
    );
}
