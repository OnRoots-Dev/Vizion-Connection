"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import CareerWizardModal from "@/components/career-wizard/CareerWizardModal";
import { OnboardingStepBar } from "../OnboardingStepBar";
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
    const router = useRouter();
    const { initFromUser } = useCareerWizard();

    useEffect(() => {
        initFromUser(userInit);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ minHeight: "100vh", background: "#0B0B0F" }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px 0" }}>
                <OnboardingStepBar current={1} />
                <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    style={{
                        background: "none", border: "none",
                        color: "rgba(255,255,255,0.35)", fontSize: 12,
                        cursor: "pointer", padding: "4px 8px",
                        whiteSpace: "nowrap", flexShrink: 0,
                    }}
                >
                    後にする
                </button>
            </div>
            <div style={{ padding: "8px 0 24px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
                    プロフィールとキャリア情報を登録します。完了後にDAY 0カードが生成されます。
                </p>
            </div>
            <CareerWizardModal
                contained
                onCompleted={() => router.push("/onboarding/day0")}
            />
        </motion.div>
    );
}
