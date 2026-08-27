"use client";

import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import { DailyLogCard } from "@/components/DailyLog/DailyLogCard";
import { DashboardHero } from "../components/DashboardHero";

export function HomeView({ profile, referralUrl, referralCount, t, roleColor, setView }: {
    profile: ProfileData;
    referralUrl: string;
    referralCount: number;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <DashboardHero profile={profile} t={t} roleColor={roleColor} />

            {/* NOTE: DAILY CIRCUIT / PULSE SCORE カードは依存API(/api/daily-circuit,
                /api/pulse/score)がMVPスコープ外で封印中のため非表示。
                機能復活時は config/mvp-scope.ts を参照。 */}

            <ProfileCardSection profile={profile} t={t} roleColor={roleColor} setView={setView} referralUrl={referralUrl} referralCount={referralCount} />

            <DailyLogCard t={t} roleColor={roleColor} role={profile.role} />
        </div>
    );
}
