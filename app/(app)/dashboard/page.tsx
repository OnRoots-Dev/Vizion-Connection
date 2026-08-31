// app/(app)/dashboard/page.tsx

import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import DashboardClient from "./DashboardClient";
import { getAdsForUser } from "@/lib/ads";
import type { DashboardView } from "./types";

export const dynamic = "force-dynamic";

function resolveInitialView(view?: string): DashboardView {
    const allowed: DashboardView[] = [
        "home",
        "contact",
        "notifications",
        "hub",
        "collections",
        "journey",
        "timeline",
        "portfolio",
        "card",
        "profile",
        "schedule",
        "news",
        "voicelab",
        "referral",
        "career",
        "discovery",
        "roadmap",
        "cheer",
        "business",
        "edit",
        "settings",
        "action_history",
        "missions",
        "activities",
        "moments",
        "viz_map",
    ];
    return allowed.includes(view as DashboardView) ? (view as DashboardView) : "home";
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams?: Promise<{ view?: string; welcome?: string }>;
}) {
    const result = await getProfileFromSession();

    if (!result.success) {
        redirect("/login?redirect=/dashboard");
    }

    const { profile, referralUrl, referralCount } = result.data;
    const ads = await getAdsForUser(profile.prefecture ?? "", profile.sport);
    const params = await searchParams;
    const initialView = resolveInitialView(params?.view);
    const canManageVoiceLab = profile.role === "Admin";

    return (
        <DashboardClient
            profile={profile}
            referralUrl={referralUrl}
            referralCount={referralCount}
            ads={ads}
            initialView={initialView}
            canManageVoiceLab={canManageVoiceLab}
            isOnboardingComplete={profile.isOnboardingComplete ?? false}
            showDay0Welcome={params?.welcome === "1"}
        />
    );
}
