"use client";

import { OnboardingStepBar } from "../OnboardingStepBar";
import { OnboardingPageTransition } from "../OnboardingPageTransition";
import OnboardingProfileForm from "./OnboardingProfileForm";
import type { UserRole } from "@/features/auth/types";

type UserInit = {
    role: UserRole;
    name: string;
    slug: string;
    sport?: string;
    region?: string;
    prefecture?: string;
    sportsCategory?: string;
    stance?: string;
    bio?: string;
    displayName?: string;
    profileImageUrl?: string;
    avatarUrl?: string | null;
    isPublic?: boolean;
    instagram?: string;
    xUrl?: string;
    tiktok?: string;
};

export default function ProfileOnboardingClient({ userInit }: { userInit: UserInit }) {
    return (
        <div
            style={{ height: "100dvh", background: "#0A0A0A", display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
            <div style={{ flexShrink: 0, padding: "16px 24px 0" }}>
                <OnboardingStepBar current={1} />
            </div>
            <OnboardingPageTransition stepKey="profile">
                <OnboardingProfileForm
                    initial={{
                        displayName: userInit.displayName ?? "",
                        sportsCategory: userInit.sportsCategory ?? "",
                        sport: userInit.sport ?? "",
                        region: userInit.region ?? "",
                        prefecture: userInit.prefecture ?? "",
                        avatarUrl: userInit.avatarUrl ?? "",
                        profileImageUrl: userInit.profileImageUrl ?? "",
                    }}
                />
            </OnboardingPageTransition>
        </div>
    );
}
