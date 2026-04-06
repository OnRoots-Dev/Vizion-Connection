// app/(app)/dashboard/page.tsx

import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import DashboardClient from "./DashboardClient";
import { getAdsForUser } from "@/lib/ads";
import type { DashboardView } from "./types";
import { canManageOpenlabByEmail } from "@/lib/auth/openlab-admin";

export const dynamic = "force-dynamic";

function resolveInitialView(view?: string): DashboardView {
    const allowed: DashboardView[] = [
        "home",
        "notifications",
        "collections",
        "card",
        "profile",
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
        "missions",
    ];
    return allowed.includes(view as DashboardView) ? (view as DashboardView) : "home";
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams?: Promise<{ view?: string }>;
}) {
    const result = await getProfileFromSession();

    if (!result.success) {
        const reason = result.reason === "unauthenticated" ? "unauthenticated" : "other";
        redirect(`/api/auth/clear?reason=${reason}`);
    }

    const { profile, referralUrl, referralCount } = result.data;
    const ads = await getAdsForUser(profile.prefecture ?? "", profile.sport);
    const params = await searchParams;
    const initialView = resolveInitialView(params?.view);
    const canManageOpenlab = canManageOpenlabByEmail(profile.email);

    return (
        <DashboardClient
            profile={profile}
            referralUrl={referralUrl}
            referralCount={referralCount}
            ads={ads}
            initialView={initialView}
            canManageOpenlab={canManageOpenlab}
        />
    );
}
