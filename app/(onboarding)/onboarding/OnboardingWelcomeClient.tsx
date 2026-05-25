"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OnboardingWelcomeClient({ displayName }: { displayName: string }) {
    const router = useRouter();

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)",
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
                    border: "1px solid rgba(167,139,250,0.2)",
                    background: "linear-gradient(145deg, rgba(167,139,250,0.08), rgba(11,11,15,0.98))",
                    padding: "36px 32px 32px",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(167,139,250,0.1)",
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                >
                    <p style={{ margin: "0 0 8px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(167,139,250,0.7)" }}>
                        WELCOME
                    </p>
                    <h1 style={{ margin: "0 0 12px", fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
                        ようこそ、<br />Vizion Connectionへ。
                    </h1>
                    <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
                        {displayName} さん、<br />
                        まず、あなたのプロフィールを登録しましょう。
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
                            background: "#a78bfa", color: "#050508",
                            fontSize: 14, fontWeight: 900, cursor: "pointer",
                            boxShadow: "0 0 24px rgba(167,139,250,0.4)",
                            transition: "all 0.2s ease",
                        }}
                    >
                        プロフィールを登録する
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        style={{
                            width: "100%", padding: "12px 20px",
                            borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)",
                            background: "transparent", color: "rgba(255,255,255,0.4)",
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
