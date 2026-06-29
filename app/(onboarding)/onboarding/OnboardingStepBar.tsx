"use client";

const STEPS = [
    { num: 1, label: "プロフィール" },
    { num: 2, label: "DAY 0" },
    { num: 3, label: "Journey" },
    { num: 4, label: "招待" },
];

export function OnboardingStepBar({ current }: { current: number }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", padding: "8px 0 0" }}>
            {STEPS.map((step, i) => {
                const done = step.num < current;
                const active = step.num === current;
                return (
                    <div key={step.num} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                            <div style={{
                                width: 26, height: 26, borderRadius: "50%",
                                background: done || active ? "var(--electric)" : "rgba(255,255,255,0.08)",
                                border: active ? "2px solid var(--electric)" : done ? "none" : "1px solid rgba(255,255,255,0.15)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, fontWeight: 900, color: done || active ? "#000" : "rgba(255,255,255,0.35)",
                                boxShadow: active ? "0 0 14px var(--electric-glow)" : "none",
                                transition: "all 0.3s ease",
                            }}>
                                {done ? "✓" : step.num}
                            </div>
                            <span style={{
                                fontSize: 8, fontWeight: active ? 900 : 500,
                                color: active ? "var(--electric)" : done ? "rgba(0,194,255,0.6)" : "rgba(255,255,255,0.28)",
                                letterSpacing: "0.04em", whiteSpace: "nowrap",
                            }}>
                                {step.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div style={{
                                flex: 1, minWidth: 8, height: 1,
                                background: done ? "rgba(0,194,255,0.5)" : "rgba(255,255,255,0.10)",
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
