"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LottieAnim } from "@/components/ui/LottieAnim";

export default function OnboardingWelcomeClient({ displayName }: { displayName: string }) {
    const router = useRouter();

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "var(--surface-1)", backdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    width: "100%", maxWidth: 480,
                    borderRadius: 24,
                    border: "1px solid rgba(0,194,255,0.15)",
                    background: "linear-gradient(145deg, rgba(0,194,255,0.06), var(--surface-2))",
                    padding: "36px 32px 32px",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                    textAlign: "center",
                }}
            >
                <div style={{ marginBottom: 24 }}>
                    <Image
                        src="/images/Vizion_Connection_logo-wt.png"
                        alt="Vizion Connection"
                        width={200}
                        height={50}
                        style={{ height: 44, width: "auto", opacity: 0.85 }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}
                >
                    <LottieAnim src="/lottie/flame-spark.json" loop className="h-28 w-28" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                >
                    <p style={{ margin: "0 0 8px", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--electric)" }}>
                        VIZION CONNECTION
                    </p>
                    <h1 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 900, color: "var(--foreground)", lineHeight: 1.2 }}>
                        あなたのPulseを、<br />刻もう。
                    </h1>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.8 }}>
                        {displayName} さん<br />
                        挑戦の記録が、信頼になる。
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}
                >
                    <button
                        type="button"
                        onClick={() => router.push("/onboarding/profile")}
                        style={{
                            width: "100%", padding: "14px 20px",
                            borderRadius: 14, border: "none",
                            background: "var(--electric)", color: "#0a0a0a",
                            fontSize: 14, fontWeight: 900, cursor: "pointer",
                            boxShadow: "0 0 24px rgba(0,194,255,0.35)",
                            transition: "all 0.2s ease",
                        }}
                    >
                        Pulseをはじめる
                    </button>
                    <button
                        type="button"
                        onClick={() => window.location.assign("/dashboard")}
                        style={{
                            width: "100%", padding: "12px 20px",
                            borderRadius: 14, border: "1px solid var(--border)",
                            background: "transparent", color: "var(--muted-foreground)",
                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                            transition: "color 0.2s ease",
                        }}
                    >
                        後にする
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
}
