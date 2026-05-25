// app/(onboarding)/onboarding/page.tsx

import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import OnboardingWelcomeClient from "./OnboardingWelcomeClient";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
    const result = await getProfileFromSession();
    if (!result.success) redirect("/login");

    const { profile } = result.data;

    return <OnboardingWelcomeClient displayName={profile.displayName} />;
}
