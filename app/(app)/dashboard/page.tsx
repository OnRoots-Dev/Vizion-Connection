// app/(app)/dashboard/page.tsx

import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import DashboardClient from "./DashboardClient";
import { getAdsForUser } from "@/lib/ads";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const result = await getProfileFromSession();

    if (!result.success) {
        const reason = result.reason === "unauthenticated" ? "unauthenticated" : "other";
        redirect(`/api/auth/clear?reason=${reason}`);
    }

    const { profile, referralUrl, referralCount } = result.data;
    const ads = await getAdsForUser(profile.prefecture ?? "", profile.sport);

    return (
        <DashboardClient
            profile={profile}
            referralUrl={referralUrl}
            referralCount={referralCount}
            ads={ads}
        />
    );
}
