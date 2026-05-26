"use client";

import { motion } from "framer-motion";
import { OnboardingStepBar } from "../OnboardingStepBar";
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

export default function ProfileOnboardingClient({ userInit: _ }: { userInit: UserInit }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ height: "100dvh", background: "#0B0B0F", display: "flex", flexDirection: "column", overflow: "hidden" }}
        >
            <div style={{ flexShrink: 0, padding: "16px 24px 0" }}>
                <OnboardingStepBar current={1} />
            </div>
            <OnboardingProfileForm />
        </motion.div>
    );
}
