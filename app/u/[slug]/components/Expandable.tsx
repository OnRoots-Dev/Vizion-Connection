// app/u/[slug]/components/Expandable.tsx
// 段階的開示（プログレッシブディスクロージャー）用の共通アコーディオン。
// - ヘッダーは 48px 以上のタップ領域＋ aria-expanded / aria-controls
// - 開閉は MOTION.slide のスプリング、reduced-motion 時は即時切替
"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MOTION, TAP_SCALE } from "@/lib/design/tokens";
import { IconChevronDown } from "@/lib/design/icons";
import { VP, VP_MONO_FONT, vpPanel } from "../profile-theme";

export default function Expandable({
    title,
    summary,
    preview,
    defaultOpen = false,
    children,
}: {
    title: string;
    summary?: string;
    /** 折りたたみ中も常時表示するプレビュー行（例: バッジアイコン帯） */
    preview?: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const reduceMotion = useReducedMotion();
    const contentId = useId();

    return (
        <section
            style={{
                ...vpPanel,
                border: `1px solid ${open ? VP.neonBorder : VP.border}`,
                overflow: "hidden",
                transition: "border-color .2s",
            }}
        >
            <motion.button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={contentId}
                whileTap={reduceMotion ? undefined : { scale: TAP_SCALE }}
                transition={MOTION.press}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    width: "100%",
                    minHeight: 48,
                    padding: "12px 16px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: VP.text,
                    textAlign: "left",
                }}
            >
                <span style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: "0.24em",
                            textTransform: "uppercase",
                            color: VP.neon,
                            fontFamily: VP_MONO_FONT,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {title}
                    </span>
                    {summary ? (
                        <span style={{ fontSize: 11, color: VP.faint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {summary}
                        </span>
                    ) : null}
                </span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={reduceMotion ? { duration: 0 } : MOTION.slide}
                    style={{ display: "inline-flex", color: open ? VP.neon : VP.faint, flexShrink: 0 }}
                    aria-hidden
                >
                    <IconChevronDown size={16} />
                </motion.span>
            </motion.button>

            {preview ? <div style={{ padding: "0 16px 12px" }}>{preview}</div> : null}

            <AnimatePresence initial={false}>
                {open ? (
                    <motion.div
                        id={contentId}
                        key="content"
                        initial={reduceMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduceMotion ? { height: "auto", opacity: 1, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                        transition={reduceMotion ? { duration: 0 } : MOTION.slide}
                        style={{ overflow: "hidden" }}
                    >
                        <div style={{ padding: "4px 16px 16px" }}>{children}</div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </section>
    );
}
