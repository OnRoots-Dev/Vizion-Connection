// app/(onboarding)/layout.tsx
import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
    const result = await getProfileFromSession();
    if (!result.success) {
        redirect("/login");
    }
    if (result.data.profile.isOnboardingComplete) {
        redirect("/dashboard");
    }

    return (
        <div style={{ minHeight: "100vh", background: "#0B0B0F", color: "#fff", fontFamily: "'Noto Sans JP', sans-serif" }}>
            {children}
        </div>
    );
}
