// app/(onboarding)/onboarding/day0/page.tsx

import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import Day0Client from "./Day0Client";

export const dynamic = "force-dynamic";

export default async function OnboardingDay0Page() {
    const result = await getProfileFromSession();
    if (!result.success) redirect("/login");

    const { profile } = result.data;

    return <Day0Client profile={profile} />;
}
