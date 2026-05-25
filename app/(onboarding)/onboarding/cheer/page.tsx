"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { OnboardingStepBar } from "../OnboardingStepBar";

export default function OnboardingCheerPage() {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ minHeight: "100vh", background: "#0B0B0F" }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px 0" }}>
                <OnboardingStepBar current={4} />
                <button
                    type="button"
                    onClick={() => router.push("/onboarding/invite")}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 12, cursor: "pointer", padding: "4px 8px", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                    後にする
                </button>
            </div>

            <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px 0", textAlign: "center" }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <p style={{ margin: "0 0 16px", fontSize: 40 }}>⚡</p>
                    <p style={{ margin: "0 0 8px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.3em", textTransform: "uppercase", color: "#FFD600", opacity: 0.8 }}>
                        CHEER
                    </p>
                    <h1 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1.4 }}>
                        Vizion Connectionは、<br />まだ始まったばかりです。
                    </h1>
                    <p style={{ margin: "0 0 32px", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.9 }}>
                        最初のCheerを送ってみましょう。<br />
                        応援することが、あなたの信頼になります。
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <button
                            type="button"
                            onClick={() => router.push("/onboarding/discovery")}
                            style={{
                                width: "100%", padding: "14px 20px", borderRadius: 14, border: "none",
                                background: "#FFD600", color: "#050508",
                                fontSize: 14, fontWeight: 900, cursor: "pointer",
                                boxShadow: "0 0 24px rgba(255,214,0,0.35)",
                                transition: "all 0.2s ease",
                            }}
                        >
                            Cheerを送る ⚡
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/onboarding/invite")}
                            style={{
                                width: "100%", padding: "12px 20px", borderRadius: 14,
                                border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                                color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                            }}
                        >
                            後にする
                        </button>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
