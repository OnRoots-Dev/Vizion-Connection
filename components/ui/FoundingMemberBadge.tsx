"use client";

import { motion } from "framer-motion";

export function FoundingMemberBadge() {
    return (
        <motion.div
            initial={{ opacity: 0.9 }}
            whileHover={{ opacity: 1 }}
            className="relative inline-flex items-center gap-[5px] rounded-[2px] py-[4px] pl-[6px] pr-[9px] font-mono text-[6.5px] font-[800] uppercase tracking-[0.2em] text-[#fff5c0] overflow-hidden cursor-default shadow-[0_0_0_1px_rgba(100,75,0,0.7),inset_0_0_0_1px_rgba(255,215,60,0.18),inset_0_1px_0_rgba(255,235,100,0.35),inset_0_-1px_0_rgba(0,0,0,0.5),0_0_10px_rgba(180,130,5,0.22),0_0_24px_rgba(180,130,5,0.08)]"
            style={{
                background: `
          linear-gradient(170deg, rgba(255,245,160,0.07) 0%, rgba(255,255,255,0.04) 30%, transparent 60%),
          linear-gradient(105deg, #1a1200 0%, #362800 15%, #7a5c00 30%, #c8940c 42%, #f5dc5a 50%, #c8940c 58%, #7a5c00 70%, #362800 85%, #1a1200 100%)
        `,
                backgroundSize: "100% 100%, 280% 100%",
                textShadow: "0 1px 0 rgba(0,0,0,0.9), 0 -1px 0 rgba(255,220,40,0.3), 0 0 6px rgba(255,200,20,0.5), 0 0 14px rgba(255,180,0,0.2)",
            }}
        >
            <motion.div
                animate={{ backgroundPosition: ["160% 0", "-60% 0"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 z-[2] pointer-events-none"
                style={{
                    background: "linear-gradient(112deg, transparent 35%, rgba(255,255,200,0.28) 47%, rgba(255,255,255,0.45) 50%, rgba(255,255,200,0.28) 53%, transparent 65%)",
                    backgroundSize: "300% 100%",
                }}
            />
            <svg className="z-[3] h-[9px] w-[9px] shrink-0 overflow-visible"
                style={{ filter: "drop-shadow(0 0 2px rgba(255,220,40,0.9)) drop-shadow(0 0 5px rgba(255,180,0,0.5))" }}
                viewBox="0 0 14 11" fill="none">
                <path d="M1 9 L3.5 3 L7 6.5 L10.5 3 L13 9" stroke="#f5dc5a" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
                <line x1="1" y1="9" x2="13" y2="9" stroke="#f5dc5a" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="1" cy="9" r="1" fill="#ffe566" />
                <circle cx="7" cy="6.5" r="1" fill="#ffe566" />
                <circle cx="13" cy="9" r="1" fill="#ffe566" />
            </svg>
            <span className="relative z-[3]">Founding Member</span>
            <div className="absolute inset-[2px] z-[4] rounded-[1px] border border-dashed border-[#ffd22826] pointer-events-none" />
        </motion.div>
    );
}

export function EarlyPartnerBadge() {
    return (
        <motion.div
            initial={{ opacity: 0.9 }}
            whileHover={{ opacity: 1 }}
            style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "4px 9px 4px 6px",
                borderRadius: "2px",
                fontFamily: "monospace", fontSize: "6.5px", fontWeight: 800,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(180,220,255,0.85)",
                background: "linear-gradient(105deg, #001a30 0%, #003060 30%, #1060a0 50%, #003060 70%, #001a30 100%)",
                backgroundSize: "280% 100%",
                boxShadow: "0 0 0 1px rgba(0,60,120,0.7), inset 0 0 0 1px rgba(80,160,255,0.18), inset 0 1px 0 rgba(120,200,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 10px rgba(20,100,200,0.2)",
                textShadow: "0 1px 0 rgba(0,0,0,0.9), 0 0 6px rgba(80,160,255,0.5)",
                position: "relative", overflow: "hidden", cursor: "default",
            }}
        >
            <motion.div
                animate={{ backgroundPosition: ["160% 0", "-60% 0"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
                    background: "linear-gradient(112deg, transparent 35%, rgba(180,220,255,0.2) 47%, rgba(220,240,255,0.35) 50%, rgba(180,220,255,0.2) 53%, transparent 65%)",
                    backgroundSize: "300% 100%",
                }}
            />
            <svg style={{ zIndex: 3, height: "9px", width: "9px", flexShrink: 0, filter: "drop-shadow(0 0 2px rgba(80,160,255,0.9))" }}
                viewBox="0 0 14 11" fill="none">
                <path d="M2 8 L7 2 L12 8" stroke="#7ab8ff" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
                <line x1="2" y1="8" x2="12" y2="8" stroke="#7ab8ff" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="7" cy="2" r="1" fill="#aad4ff" />
                <circle cx="2" cy="8" r="1" fill="#aad4ff" />
                <circle cx="12" cy="8" r="1" fill="#aad4ff" />
            </svg>
            <span style={{ position: "relative", zIndex: 3 }}>Early Partner</span>
            <div style={{ position: "absolute", inset: "2px", zIndex: 4, borderRadius: "1px", border: "1px dashed rgba(80,160,255,0.2)", pointerEvents: "none" }} />
        </motion.div>
    );
}