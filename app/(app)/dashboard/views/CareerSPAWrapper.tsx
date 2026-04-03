"use client";

// dashboard/views/CareerSPAWrapper.tsx

import { useState, useEffect } from "react";
import CareerDashboardClient from "@/app/(app)/dashboard/career/CareerDashboardClient";
import type { ProfileData } from "@/features/profile/types";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ViewHeader } from "@/app/(app)/dashboard/components/ui";

interface Props {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;

    careerCache?: any;
}

export function CareerSPAWrapper({ profile, t, roleColor, setView, careerCache }: Props) {

    const [careerProfile, setCareerProfile] = useState<any>(
        careerCache !== undefined ? careerCache : undefined
    );
    const [loading, setLoading] = useState(careerCache === undefined);

    useEffect(() => {

        if (careerCache !== undefined) {
            setCareerProfile(careerCache);
            setLoading(false);
            return;
        }
        fetch("/api/career/me")
            .then(r => r.json())
            .then(d => setCareerProfile(d.careerProfile ?? null))
            .catch(() => setCareerProfile(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: t.sub, fontSize: 12 }}>
                読み込み中...
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader title="Career" sub="キャリアページを編集・公開" onBack={() => setView("home")} t={t} roleColor={roleColor} />
            <CareerDashboardClient
                embedded
                user={{
                    slug: profile.slug,
                    displayName: profile.displayName,
                    role: profile.role,
                    sport: profile.sport ?? "",
                    region: profile.region ?? "",
                    instagram: profile.instagram ?? "",
                    xUrl: profile.xUrl ?? "",
                    tiktok: profile.tiktok ?? "",
                    cheerCount: profile.cheerCount ?? 0,
                    avatarUrl: profile.avatarUrl ?? null,
                }}
                careerProfile={careerProfile}
                onBack={() => setView("home")}
            />
        </div>
    );
}
