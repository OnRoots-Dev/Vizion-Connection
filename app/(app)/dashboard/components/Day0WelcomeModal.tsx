"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LottieAnim } from "@/components/ui/LottieAnim";

const STORAGE_KEY = "vc_day0_welcome_shown";

// オンボーディング完了直後（/dashboard?welcome=1）の初回のみ表示するウェルカム演出。
// localStorageで再表示を防止する。
export function Day0WelcomeModal({ enabled }: { enabled: boolean }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!enabled) return;
        try {
            if (localStorage.getItem(STORAGE_KEY)) return;
            localStorage.setItem(STORAGE_KEY, new Date().toISOString());
        } catch {
            // localStorage不可の環境ではそのまま表示
        }
        setOpen(true);
        // welcome=1 をURLから除去（リロード時の再判定を防ぐ）
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete("welcome");
            window.history.replaceState(null, "", url.toString());
        } catch {
            // ignore
        }
    }, [enabled]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: "fixed", inset: 0, zIndex: 100,
                        background: "rgba(5,5,8,0.88)", backdropFilter: "blur(10px)",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 12 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            width: "100%", maxWidth: 420,
                            borderRadius: 24, padding: "36px 28px 28px",
                            border: "1px solid rgba(255,107,0,0.25)",
                            background: "linear-gradient(160deg, rgba(255,107,0,0.08), rgba(0,194,255,0.05) 55%, #101012)",
                            boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 48px rgba(255,107,0,0.12)",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                            <LottieAnim src="/lottie/flame-spark.json" loop className="h-32 w-32" />
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25, duration: 0.4 }}
                            style={{ margin: "0 0 6px", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--pulse)" }}
                        >
                            YOUR JOURNEY BEGINS
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.4 }}
                            style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}
                        >
                            DAY 0 が始まりました
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45, duration: 0.4 }}
                            style={{ margin: "0 0 28px", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.9 }}
                        >
                            今日が、あなたの挑戦の原点です。<br />
                            毎日のJourneyが、DAYカウントを積み上げます。
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55, duration: 0.4 }}
                            type="button"
                            onClick={() => setOpen(false)}
                            style={{
                                width: "100%", padding: "14px 20px",
                                borderRadius: 14, border: "none",
                                background: "var(--electric)", color: "#fff",
                                fontSize: 14, fontWeight: 900, cursor: "pointer",
                                boxShadow: "0 0 24px var(--electric-glow)",
                            }}
                        >
                            Pulseをはじめる
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
