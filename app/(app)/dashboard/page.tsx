// app/(app)/dashboard/page.tsx

import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // ← 修正
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies"; // ← 修正
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const result = await getProfileFromSession();

    if (!result.success) {

        const cookieStore = await cookies();
        cookieStore.delete(SESSION_COOKIE_NAME);
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