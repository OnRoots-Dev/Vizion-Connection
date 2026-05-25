// app/(onboarding)/layout.tsx

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: "100vh", background: "#0B0B0F", color: "#fff", fontFamily: "'Noto Sans JP', sans-serif" }}>
            {children}
        </div>
    );
}
