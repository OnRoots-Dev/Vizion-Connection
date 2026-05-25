// app/(onboarding)/onboarding/discovery/page.tsx

import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import DiscoveryOnboardingClient from "./DiscoveryOnboardingClient";

export const dynamic = "force-dynamic";

export default async function OnboardingDiscoveryPage() {
    const result = await getProfileFromSession();
    if (!result.success) redirect("/login");

    return <DiscoveryOnboardingClient />;
}
