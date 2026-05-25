"use client";

const STEPS = [
    { num: 1, label: "プロフィール" },
    { num: 2, label: "DAY 0" },
    { num: 3, label: "Journey" },
    { num: 4, label: "Cheer" },
    { num: 5, label: "招待" },
];

export function OnboardingStepBar({ current }: { current: number }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, padding: "20px 24px 0" }}>
            {STEPS.map((step, i) => {
                const done = step.num < current;
                const active = step.num === current;
                return (
                    <div key={step.num} style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                background: done ? "#a78bfa" : active ? "#a78bfa" : "rgba(255,255,255,0.08)",
                                border: active ? "2px solid #a78bfa" : done ? "none" : "1px solid rgba(255,255,255,0.15)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 900, color: done || active ? "#000" : "rgba(255,255,255,0.35)",
                                boxShadow: active ? "0 0 14px rgba(167,139,250,0.5)" : "none",
                                transition: "all 0.3s ease",
                            }}>
                                {done ? "✓" : step.num}
                            </div>
                            <span style={{
                                fontSize: 9, fontWeight: active ? 900 : 500,
                                color: active ? "#a78bfa" : done ? "rgba(167,139,250,0.6)" : "rgba(255,255,255,0.28)",
                                letterSpacing: "0.06em", whiteSpace: "nowrap",
                            }}>
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div style={{
                                width: 32, height: 1,
                                background: done ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.10)",
                                margin: "0 4px", marginBottom: 16,
                                transition: "background 0.3s ease",
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
