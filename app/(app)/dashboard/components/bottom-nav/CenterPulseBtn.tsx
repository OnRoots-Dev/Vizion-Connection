"use client";

import { motion } from "framer-motion";

interface Props {
    expanded: boolean;
    onToggle: () => void;
    roleColor: string;
}

// 中央の Pulse ボタン。Bottom Bar から浮き上がり、タップで Fan を開閉する。
// expanded 時はアイコンが × に回転。常時パルスリングのアニメーションを持つ。
export function CenterPulseBtn({ expanded, onToggle, roleColor }: Props) {
    return (
        <div
            style={{
                position: "relative",
                width: 60,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
            }}
        >
            <motion.button
                type="button"
                aria-label={expanded ? "メニューを閉じる" : "Pulse メニューを開く"}
                aria-expanded={expanded}
                onClick={onToggle}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 480, damping: 26 }}
                style={{
                    position: "absolute",
                    bottom: 6,
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    pointerEvents: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(150deg, var(--pulse), var(--electric))",
                    boxShadow: `0 8px 24px var(--electric-glow), 0 0 0 4px ${roleColor}14`,
                    color: "#fff",
                }}
            >
                {/* パルスリング（常時） */}
                {!expanded && (
                    <motion.span
                        aria-hidden
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.7 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "50%",
                            border: "2px solid var(--electric)",
                        }}
                    />
                )}
                <motion.svg
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    animate={{ rotate: expanded ? 135 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    style={{ position: "relative" }}
                >
                    {expanded ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h2.25m13.5 0h2.25m-15.75 0a6.75 6.75 0 1113.5 0" />
                    )}
                </motion.svg>
            </motion.button>
        </div>
    );
}
