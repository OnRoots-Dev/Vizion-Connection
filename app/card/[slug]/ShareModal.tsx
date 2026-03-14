"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ShareTarget } from "./useShareCard";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onShareTo: (target: ShareTarget) => Promise<void>;
    isGenerating: boolean;
    imageUrl: string | null;
    displayName: string;
    roleColor: string;
}

// ── SNSボタン定義 ────────────────────────────────────────────────────────────
const SNS_BUTTONS: Array<{
    target: ShareTarget;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    bg: string;
    border: string;
    color: string;
    note?: string;
}> = [
        {
            target: "native",
            label: "共有する",
            sublabel: "アプリで開く",
            bg: "rgba(255,255,255,0.06)",
            border: "rgba(255,255,255,0.14)",
            color: "#ffffff",
            icon: (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
            ),
        },
        {
            target: "x",
            label: "X でポスト",
            sublabel: "投稿画面を開く",
            bg: "rgba(0,0,0,0.6)",
            border: "rgba(255,255,255,0.12)",
            color: "#ffffff",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
        {
            target: "instagram",
            label: "Instagram",
            sublabel: "画像を保存してシェア",
            bg: "linear-gradient(135deg, rgba(131,58,180,0.3), rgba(253,29,29,0.3), rgba(252,176,69,0.3))",
            border: "rgba(253,29,29,0.3)",
            color: "#ffffff",
            note: "画像を保存→アプリで投稿",
            icon: (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
            ),
        },
        {
            target: "tiktok",
            label: "TikTok",
            sublabel: "画像を保存してシェア",
            bg: "rgba(0,0,0,0.6)",
            border: "rgba(255,0,80,0.3)",
            color: "#ffffff",
            note: "画像を保存→アプリで投稿",
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                </svg>
            ),
        },
        {
            target: "line",
            label: "LINE",
            sublabel: "トーク・タイムラインに共有",
            bg: "rgba(0,185,0,0.15)",
            border: "rgba(0,185,0,0.3)",
            color: "#00B900",
            icon: (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.91 2.572-3.852 2.572-5.992zm-18.988 2.595c0 .158-.129.287-.287.287h-3.621c-.158 0-.287-.129-.287-.287v-5.632c0-.158.129-.287.287-.287h.908c.158 0 .287.129.287.287v4.437h2.426c.158 0 .287.129.287.287v.908zm2.242 0c0 .158-.129.287-.287.287h-.908c-.158 0-.287-.129-.287-.287v-5.632c0-.158.129-.287.287-.287h.908c.158 0 .287.129.287.287v5.632zm5.764 0c0 .158-.129.287-.287.287h-.908c-.053 0-.102-.015-.145-.041l-2.606-3.519v3.273c0 .158-.129.287-.287.287h-.908c-.158 0-.287-.129-.287-.287v-5.632c0-.158.129-.287.287-.287h.908c.054 0 .103.015.146.041l2.605 3.519v-3.273c0-.158.129-.287.287-.287h.908c.158 0 .287.129.287.287v5.632zm4.253-4.437c0 .158-.129.287-.287.287h-2.426v.908h2.426c.158 0 .287.129.287.287v.908c0 .158-.129.287-.287.287h-2.426v.908h2.426c.158 0 .287.129.287.287v.908c0 .158-.129.287-.287.287h-3.621c-.158 0-.287-.129-.287-.287v-5.632c0-.158.129-.287.287-.287h3.621c.158 0 .287.129.287.287v.908z" />
                </svg>
            ),
        },
        {
            target: "download",
            label: "画像を保存",
            sublabel: "PNG でダウンロード",
            bg: "rgba(255,255,255,0.04)",
            border: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
            icon: (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
            ),
        },
    ];

export function ShareModal({ isOpen, onClose, onShareTo, isGenerating, imageUrl, displayName, roleColor }: Props) {
    const [loadingTarget, setLoadingTarget] = useState<ShareTarget | null>(null);
    const [doneTarget, setDoneTarget] = useState<ShareTarget | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // ESCキーで閉じる
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    async function handleClick(target: ShareTarget) {
        setLoadingTarget(target);
        await onShareTo(target);
        setLoadingTarget(null);
        setDoneTarget(target);
        setTimeout(() => setDoneTarget(null), 2000);
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* オーバーレイ */}
                    <motion.div
                        ref={overlayRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        style={{
                            position: "fixed", inset: 0, zIndex: 100,
                            background: "rgba(0,0,0,0.75)",
                            backdropFilter: "blur(6px)",
                        }}
                    />

                    {/* モーダル本体 */}
                    <motion.div
                        initial={{ opacity: 0, y: 48, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 32, scale: 0.97 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: "fixed",
                            bottom: 0, left: 0, right: 0,
                            zIndex: 101,
                            background: "#0d0d1a",
                            borderTop: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "20px 20px 0 0",
                            padding: "0 0 env(safe-area-inset-bottom, 16px)",
                            maxWidth: "560px",
                            margin: "0 auto",
                        }}
                    >
                        {/* ハンドル */}
                        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
                            <div style={{ width: "36px", height: "4px", borderRadius: "99px", background: "rgba(255,255,255,0.15)" }} />
                        </div>

                        <div style={{ padding: "8px 20px 24px" }}>

                            {/* ヘッダー */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                <div>
                                    <p style={{ fontSize: "16px", fontWeight: 800, color: "#fff", margin: 0 }}>
                                        カードをシェア
                                    </p>
                                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: "3px 0 0" }}>
                                        {displayName} のプロフィールカード
                                    </p>
                                </div>
                                <button onClick={onClose} style={{
                                    width: "32px", height: "32px", borderRadius: "50%",
                                    background: "rgba(255,255,255,0.06)", border: "none",
                                    color: "rgba(255,255,255,0.5)", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* カードプレビュー（生成中 / 生成済み） */}
                            <div style={{
                                height: "80px", borderRadius: "12px", marginBottom: "16px",
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                overflow: "hidden",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                position: "relative",
                            }}>
                                {isGenerating ? (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                                        {/* スピナー */}
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            style={{
                                                width: "22px", height: "22px", borderRadius: "50%",
                                                border: `2px solid rgba(255,255,255,0.1)`,
                                                borderTop: `2px solid ${roleColor}`,
                                            }}
                                        />
                                        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                                            カード画像を生成中…
                                        </p>
                                    </div>
                                ) : imageUrl ? (
                                    <>
                                        <img
                                            src={imageUrl}
                                            alt="カードプレビュー"
                                            style={{ height: "100%", objectFit: "contain" }}
                                        />
                                        <div style={{
                                            position: "absolute", top: "6px", right: "8px",
                                            fontSize: "8px", fontFamily: "monospace", fontWeight: 700,
                                            letterSpacing: "0.1em",
                                            background: `${roleColor}20`, color: roleColor,
                                            border: `1px solid ${roleColor}35`,
                                            padding: "2px 6px", borderRadius: "4px",
                                        }}>
                                            PNG 生成済み
                                        </div>
                                    </>
                                ) : (
                                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>
                                        プレビューを準備中…
                                    </p>
                                )}
                            </div>

                            {/* SNS ボタングリッド */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                                {/* 上段: native (全幅) */}
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <ShareButton
                                        btn={SNS_BUTTONS[0]}
                                        roleColor={roleColor}
                                        loading={loadingTarget === "native"}
                                        done={doneTarget === "native"}
                                        onClick={() => handleClick("native")}
                                    />
                                </div>

                                {/* X, Instagram */}
                                {SNS_BUTTONS.slice(1, 3).map(btn => (
                                    <ShareButton
                                        key={btn.target}
                                        btn={btn}
                                        roleColor={roleColor}
                                        loading={loadingTarget === btn.target}
                                        done={doneTarget === btn.target}
                                        onClick={() => handleClick(btn.target)}
                                    />
                                ))}

                                {/* TikTok, LINE */}
                                {SNS_BUTTONS.slice(3, 5).map(btn => (
                                    <ShareButton
                                        key={btn.target}
                                        btn={btn}
                                        roleColor={roleColor}
                                        loading={loadingTarget === btn.target}
                                        done={doneTarget === btn.target}
                                        onClick={() => handleClick(btn.target)}
                                    />
                                ))}

                                {/* 画像保存 (全幅) */}
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <ShareButton
                                        btn={SNS_BUTTONS[5]}
                                        roleColor={roleColor}
                                        loading={loadingTarget === "download"}
                                        done={doneTarget === "download"}
                                        onClick={() => handleClick("download")}
                                    />
                                </div>
                            </div>

                            {/* Instagram/TikTok への補足 */}
                            <p style={{
                                fontSize: "10px", color: "rgba(255,255,255,0.2)",
                                textAlign: "center", lineHeight: 1.6, margin: 0,
                            }}>
                                Instagram・TikTokは画像を保存してからアプリで投稿してください
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ── 個別シェアボタン ──────────────────────────────────────────────────────────
function ShareButton({
    btn, roleColor, loading, done, onClick,
}: {
    btn: (typeof SNS_BUTTONS)[number];
    roleColor: string;
    loading: boolean;
    done: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            style={{
                width: "100%",
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: done ? `${roleColor}18` : btn.bg,
                border: `1px solid ${done ? roleColor + "40" : btn.border}`,
                color: done ? roleColor : btn.color,
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.2s",
                textAlign: "left",
            }}
        >
            {/* アイコン */}
            <div style={{ flexShrink: 0, width: "22px", display: "flex", justifyContent: "center" }}>
                {loading ? (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        style={{
                            width: "16px", height: "16px", borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.1)",
                            borderTop: `2px solid ${btn.color}`,
                        }}
                    />
                ) : done ? (
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                ) : btn.icon}
            </div>

            {/* テキスト */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "12px", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                    {done ? "完了！" : btn.label}
                </p>
                {btn.sublabel && (
                    <p style={{ fontSize: "9px", opacity: 0.5, margin: "2px 0 0", lineHeight: 1 }}>
                        {btn.note ?? btn.sublabel}
                    </p>
                )}
            </div>

            {/* 矢印 */}
            {!loading && !done && (
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0, opacity: 0.3 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            )}
        </button>
    );
}