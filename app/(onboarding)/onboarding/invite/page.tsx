// app/(onboarding)/onboarding/invite/page.tsx

import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import InviteClient from "./InviteClient";

export const dynamic = "force-dynamic";

export default async function OnboardingInvitePage() {
    const result = await getProfileFromSession();
    if (!result.success) redirect("/login");

    const { profile } = result.data;
    const referralUrl = `https://vizion-connection.jp/register?ref=${profile.slug}`;

    return <InviteClient slug={profile.slug} referralUrl={referralUrl} />;
}
