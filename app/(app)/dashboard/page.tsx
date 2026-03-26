// app/(app)/dashboard/page.tsx

import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const result = await getProfileFromSession();

    if (!result.success) {
        // ✅ Cookie削除はRoute Handlerに任せる
        // /api/logout を経由してloginへリダイレクト
        const reason = result.reason === "unauthenticated" ? "unauthenticated" : "other";
        redirect(`/api/auth/clear?reason=${reason}`);
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