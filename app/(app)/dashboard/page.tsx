// app/(app)/dashboard/page.tsx

import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
    const result = await getProfileFromSession();

    if (!result.success) {
        redirect(result.reason === "unauthenticated" ? "/login?redirect=/dashboard" : "/login");
    }

    const { profile, referralUrl, referralCount } = result.data;

    return (
        <DashboardClient
            profile={profile}
            referralUrl={referralUrl}
            referralCount={referralCount}
        />
    );
}