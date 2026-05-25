// app/(onboarding)/onboarding/profile/page.tsx

import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import ProfileOnboardingClient from "./ProfileOnboardingClient";

export const dynamic = "force-dynamic";

export default async function OnboardingProfilePage() {
    const result = await getProfileFromSession();
    if (!result.success) redirect("/login");

    const { profile } = result.data;

    return (
        <ProfileOnboardingClient
            userInit={{
                role: profile.role,
                name: profile.displayName,
                slug: profile.slug,
                sport: profile.sport,
                region: profile.region,
                prefecture: profile.prefecture,
                sportsCategory: profile.sportsCategory,
                stance: profile.stance,
                bio: profile.bio,
                displayName: profile.displayName,
                profileImageUrl: profile.profileImageUrl,
                avatarUrl: profile.avatarUrl,
                isPublic: profile.isPublic !== false,
                instagram: profile.instagram,
                xUrl: profile.xUrl,
                tiktok: profile.tiktok,
            }}
        />
    );
}
