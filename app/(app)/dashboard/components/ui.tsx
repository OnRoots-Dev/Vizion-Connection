"use client";

// ─────────────────────────────────────────────────────────────────────────────
// dashboard/components/ui.tsx  — SectionCard / SLabel / ViewHeader / Buttons
// すべてのビューコンポーネントがここからインポートする
// Apple Design: spring ベース・押下フィードバック・reduced-motion 尊重
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import {
    motion,
    AnimatePresence,
    useReducedMotion,
    useMotionValue,
    useSpring,
    useTransform,
    type Transition,
} from "framer-motion";
import type { ThemeColors } from "../types";
import { springSnap, fadeReduced } from "@/lib/motion/apple-springs";
import { PRESS_SCALE } from "@/components/ui/Pressable";

const pressSpring: Transition = {
    type: "spring",
    stiffness: 600,
    damping: 32,
    mass: 0.5,
};

const hoverSpring: Transition = {
    type: "spring",
    stiffness: 420,
    damping: 36,
    mass: 0.75,
};

/** 数値用: やや質量があり慣性を感じる critically damped spring */
const numberSpring = {
    stiffness: 120,
    damping: 22,
    mass: 1.1,
};

// ── カードコンテナ ────────────────────────────────────────────────────────────
export function SectionCard({
    children,
    accentColor,
    t,
}: {
    children: React.ReactNode;
    accentColor?: string;
    t: ThemeColors;
}) {
    const reduce = useReducedMotion();
    void t;

    return (
        <motion.div
            className="relative overflow-hidden"
            style={{
                background: "#111118",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "20px 24px",
                boxShadow: "0 0 0 rgba(0,0,0,0)",
                willChange: "transform, box-shadow",
            }}
            // 出現: 直前の presentation から target へ（再ターゲット可能）
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
            transition={reduce ? fadeReduced : hoverSpring}
            whileHover={
                reduce
                    ? undefined
                    : {
                          y: -3,
                          boxShadow: "0 14px 44px rgba(0,0,0,0.38)",
                      }
            }
            // hover 中の割込みも spring で現在値から戻る
            whileTap={reduce ? undefined : { y: -1, scale: 0.995 }}
        >
            {accentColor && (
                <div
                    className="pointer-events-none absolute -top-[30px] -right-[30px] h-[120px] w-[120px] rounded-full"
                    style={{
                        background: `radial-gradient(circle,${accentColor}12,transparent 70%)`,
                    }}
                />
            )}
            <div className="relative z-[1]">{children}</div>
        </motion.div>
    );
}
// ── セクションラベル ──────────────────────────────────────────────────────────
export function SLabel({ text, color, size }: { text: string; color?: string; size?: number }) {
    return (
        <p
            style={{
                fontFamily: "'Space Mono', 'SF Mono', 'Fira Code', monospace",
                fontSize: size ?? 10,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: color ?? "rgba(255,255,255,0.28)",
                marginBottom: 12,
            }}
        >
            {text}
        </p>
    );
}

export function ActionPill({
    children,
    onClick,
    href,
    color,
    t,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    color: string;
    t?: ThemeColors;
}) {
    const reduce = useReducedMotion();
    void t;

    const style: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        minHeight: 30,
        padding: "6px 11px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 800,
        fontFamily: "'Space Mono', 'SF Mono', 'Fira Code', monospace",
        letterSpacing: "0.08em",
        background: `${color}14`,
        outline: `1px solid ${color}26`,
        color,
        textDecoration: "none",
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        userSelect: "none",
    };

    if (href) {
        return (
            <motion.a
                href={href}
                style={style}
                whileTap={reduce ? undefined : { scale: PRESS_SCALE }}
                transition={pressSpring}
            >
                {children}
            </motion.a>
        );
    }

    return (
        <motion.button
            type="button"
            onClick={onClick}
            style={style}
            whileTap={reduce ? undefined : { scale: PRESS_SCALE }}
            transition={pressSpring}
        >
            {children}
        </motion.button>
    );
}

export function CardHeader({
    title,
    color,
    action,
    meta,
}: {
    title: string;
    color?: string;
    action?: React.ReactNode;
    meta?: React.ReactNode;
}) {
    void color;
    return (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#f0f0f5",
                        margin: 0,
                        lineHeight: 1.02,
                        letterSpacing: "-0.01em",
                        textTransform: "uppercase" as const,
                    }}
                >
                    {title}
                </div>
                {meta ? <div style={{ marginTop: 4 }}>{meta}</div> : null}
            </div>
            {action ? <div style={{ marginLeft: "auto" }}>{action}</div> : null}
        </div>
    );
}

// ── ビューヘッダー（戻るボタン付き） ─────────────────────────────────────────
export function ViewHeader({
    title,
    sub,
    onBack,
    t,
    roleColor,
}: {
    title: string;
    sub: string;
    onBack: () => void;
    t: ThemeColors;
    roleColor: string;
}) {
    const reduce = useReducedMotion();
    void t;
    void roleColor;

    return (
        <div className="mb-1 flex items-center gap-3">
            <motion.button
                onClick={onBack}
                type="button"
                aria-label="戻る"
                title="戻る"
                whileTap={reduce ? undefined : { scale: PRESS_SCALE }}
                whileHover={reduce ? undefined : { borderColor: "rgba(255,255,255,0.28)", backgroundColor: "rgba(255,255,255,0.04)" }}
                transition={pressSpring}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "transparent",
                    cursor: "pointer",
                }}
            >
                <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.55)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </motion.button>
            {/* タイトル切替: キー変更時も AnimatePresence で現在値→次へ（presentation 起点） */}
            <div style={{ minWidth: 0, overflow: "hidden" }}>
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={`${title}::${sub}`}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        transition={reduce ? fadeReduced : springSnap}
                    >
                        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#f0f0f5", letterSpacing: "-0.01em" }}>
                            {title}
                        </h2>
                        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{sub}</p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ── ローディングスピナー ──────────────────────────────────────────────────────
export function ViewLoader({ t }: { t: ThemeColors }) {
    void t;
    return (
        <div
            className="flex h-[200px] items-center justify-center"
            style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 12,
            }}
        >
            読み込み中...
        </div>
    );
}

// ── ボタン群 ──────────────────────────────────────────────────────────────────
function DashboardButton({
    children,
    onClick,
    disabled,
    style,
    variant,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
    variant: "primary" | "secondary" | "danger";
}) {
    const reduce = useReducedMotion();

    const base: React.CSSProperties =
        variant === "primary"
            ? {
                  background: "#C8E800",
                  color: "#000000",
                  borderRadius: 8,
                  padding: "11px 20px",
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  boxShadow: "0 0 20px rgba(200,232,0,0.28)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.45 : 1,
              }
            : variant === "secondary"
              ? {
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.16)",
                    color: "rgba(255,255,255,0.6)",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.45 : 1,
                }
              : {
                    background: "rgba(255,59,48,0.12)",
                    border: "1px solid rgba(255,59,48,0.3)",
                    color: "#ff3b30",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.45 : 1,
                };

    return (
        <motion.button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{ ...base, ...style, userSelect: "none" }}
            whileTap={disabled || reduce ? undefined : { scale: PRESS_SCALE }}
            whileHover={
                disabled || reduce
                    ? undefined
                    : variant === "primary"
                      ? { boxShadow: "0 0 28px rgba(200,232,0,0.4)", filter: "brightness(1.04)" }
                      : variant === "secondary"
                        ? { borderColor: "rgba(255,255,255,0.28)", color: "rgba(255,255,255,0.85)" }
                        : { backgroundColor: "rgba(255,59,48,0.18)" }
            }
            transition={pressSpring}
        >
            {children}
        </motion.button>
    );
}

export function PrimaryButton({
    children,
    onClick,
    disabled,
    style,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <DashboardButton variant="primary" onClick={onClick} disabled={disabled} style={style}>
            {children}
        </DashboardButton>
    );
}

export function SecondaryButton({
    children,
    onClick,
    disabled,
    style,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <DashboardButton variant="secondary" onClick={onClick} disabled={disabled} style={style}>
            {children}
        </DashboardButton>
    );
}

export function DangerButton({
    children,
    onClick,
    disabled,
    style,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <DashboardButton variant="danger" onClick={onClick} disabled={disabled} style={style}>
            {children}
        </DashboardButton>
    );
}

// ── SectionHeader（ラベル + 区切り線） ────────────────────────────────────────
export function SectionHeader({ label }: { label: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span
                style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    fontFamily: "'Space Mono', monospace",
                    color: "var(--vc-text3)",
                }}
            >
                {label}
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--vc-border)" }} />
        </div>
    );
}

// ── Pulse 日数の spring 数値 ──────────────────────────────────────────────────
function SpringDays({ value, color, fontSize }: { value: number; color: string; fontSize: number }) {
    const reduce = useReducedMotion();
    const mv = useMotionValue(value);
    const spring = useSpring(mv, numberSpring);
    const display = useTransform(spring, (v) => Math.round(v).toString());
    const first = useRef(true);

    useEffect(() => {
        if (reduce || first.current) {
            mv.jump(value);
            first.current = false;
            return;
        }
        mv.set(value);
    }, [value, mv, reduce]);

    return (
        <motion.span style={{ color, fontSize, fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>
            {display}
        </motion.span>
    );
}

// ── PulseIndicator（継続日数 + 波動バー） ────────────────────────────────────
export function PulseIndicator({ days, size = "md" }: { days: number; size?: "sm" | "md" | "lg" }) {
    const reduce = useReducedMotion();
    const sizes = { sm: 11, md: 13, lg: 15 } as const;
    const fontSize = sizes[size];

    const getColor = (d: number) => {
        if (d >= 100) return "#ffffff";
        if (d >= 30) return "#e2f56b";
        if (d >= 7) return "#C8E800";
        return "rgba(200,232,0,0.6)";
    };
    const color = getColor(days);

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize,
                color,
                fontFamily: "'Space Mono', monospace",
                fontWeight: 600,
            }}
        >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 2, height: fontSize }}>
                {[0.5, 0.9, 0.65, 1, 0.55].map((h, i) =>
                    reduce ? (
                        <span
                            key={i}
                            style={{
                                display: "inline-block",
                                width: 2,
                                height: fontSize * h,
                                borderRadius: 9,
                                background: color,
                            }}
                        />
                    ) : (
                        <motion.span
                            key={i}
                            style={{
                                display: "inline-block",
                                width: 2,
                                height: fontSize * h,
                                borderRadius: 9,
                                background: color,
                                transformOrigin: "center bottom",
                            }}
                            animate={{ scaleY: [0.55, 1, 0.7, 1] }}
                            transition={{
                                duration: 1.35,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.1,
                            }}
                        />
                    ),
                )}
            </span>
            PULSE{" "}
            <SpringDays value={days} color={color} fontSize={fontSize} />
            日
        </span>
    );
}

// ── StatBlock（大きな数値 + ラベル） ─────────────────────────────────────────
export function StatBlock({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
    const reduce = useReducedMotion();
    const numeric = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
    const isNumeric = Number.isFinite(numeric) && String(value).trim() !== "" && !Number.isNaN(numeric);

    const mv = useMotionValue(isNumeric ? numeric : 0);
    const spring = useSpring(mv, numberSpring);
    const display = useTransform(spring, (v) => Math.round(v).toLocaleString("en-US"));
    const first = useRef(true);

    useEffect(() => {
        if (!isNumeric) return;
        if (reduce || first.current) {
            mv.jump(numeric);
            first.current = false;
            return;
        }
        mv.set(numeric);
    }, [numeric, isNumeric, mv, reduce]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
                style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: accent || "var(--vc-text1)",
                    lineHeight: 1,
                    fontFamily: "'Space Mono', monospace",
                }}
            >
                {isNumeric ? <motion.span>{display}</motion.span> : value}
            </span>
            <span style={{ fontSize: 11, color: "var(--vc-text3)", letterSpacing: "0.05em" }}>{label}</span>
        </div>
    );
}
