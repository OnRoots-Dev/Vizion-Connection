// app/(onboarding)/onboarding/journey/page.tsx

import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import JourneyOnboardingClient from "./JourneyOnboardingClient";

export const dynamic = "force-dynamic";

export default async function OnboardingJourneyPage() {
    const result = await getProfileFromSession();
    if (!result.success) redirect("/login");

    const { profile } = result.data;
    const roleColor: Record<string, string> = {
        Athlete: "#FF5050", Trainer: "#30de1d", Crew: "#FFC81E", Business: "#3C8CFF", Admin: "#a78bfa",
    };

    return <JourneyOnboardingClient role={profile.role} roleColor={roleColor[profile.role] ?? "#a78bfa"} />;
}
