"use client";

// dashboard/components/core/PlacePicker.tsx
// Activity作成時の場所選択。検索（GET /api/places）→ 選択 or 手動登録（POST /api/places）。
// ジオコーディングProviderは導入しない。座標は「詳細」に手動入力（既定は東京駅・approximate）。

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { apiGet, apiSend, ApiError } from "@/lib/api/core-client";
import type { PlaceRecord } from "@/features/place/place";
import { PREFECTURES_BY_REGION } from "@/lib/discovery-filters";

const ALL_PREFECTURES = Object.values(PREFECTURES_BY_REGION).flat();

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#f0f0f5",
    fontSize: 13,
    outline: "none",
};

export function PlacePicker({
    value,
    onChange,
}: {
    value: PlaceRecord | null;
    onChange: (p: PlaceRecord | null) => void;
}) {
    const reduce = useReducedMotion();
    const [mode, setMode] = useState<"idle" | "search" | "create">("idle");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PlaceRecord[]>([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");

    // 手動登録フォーム
    const [name, setName] = useState("");
    const [prefecture, setPrefecture] = useState("東京都");
    const [address, setAddress] = useState("");
    const [lat, setLat] = useState("35.6812");
    const [lng, setLng] = useState("139.7671");
    const [placeType, setPlaceType] = useState("facility");
    const [creating, setCreating] = useState(false);

    async function runSearch() {
        setSearching(true);
        setError("");
        try {
            const data = await apiGet<{ success: boolean; places: PlaceRecord[] }>(
                `/api/places?q=${encodeURIComponent(query)}`,
            );
            setResults(data.places ?? []);
            setSearched(true);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "検索に失敗しました");
        } finally {
            setSearching(false);
        }
    }

    async function createPlace() {
        setCreating(true);
        setError("");
        try {
            const data = await apiSend<{ success: boolean; place: PlaceRecord }>("/api/places", "POST", {
                name,
                prefecture,
                address: address || null,
                latitude: Number(lat),
                longitude: Number(lng),
                precision: "approximate",
                place_type: placeType,
            });
            onChange(data.place);
            setMode("idle");
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "場所を登録できませんでした");
        } finally {
            setCreating(false);
        }
    }

    if (value && mode === "idle") {
        return (
            <div
                style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                    padding: "10px 12px", borderRadius: 10,
                    background: "rgba(200,232,0,0.06)", border: "1px solid rgba(200,232,0,0.22)",
                }}
            >
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f5" }}>{value.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                        {value.prefecture} · {value.precision === "approximate" ? "おおよその位置" : "正確な位置"}
                    </div>
                </div>
                <motion.button
                    type="button"
                    whileTap={reduce ? undefined : { scale: 0.94 }}
                    onClick={() => onChange(null)}
                    style={{
                        padding: "6px 10px", fontSize: 11, borderRadius: 999,
                        background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                        color: "rgba(255,255,255,0.6)", cursor: "pointer",
                    }}
                >
                    変更
                </motion.button>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mode === "idle" ? (
                <>
                    <button
                        type="button"
                        onClick={() => setMode("search")}
                        style={{
                            ...inputStyle, textAlign: "left", cursor: "pointer",
                            color: "rgba(255,255,255,0.45)",
                        }}
                    >
                        場所を検索・選択する
                    </button>
                </>
            ) : mode === "search" ? (
                <>
                    <div style={{ display: "flex", gap: 6 }}>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && runSearch()}
                            placeholder="場所名で検索"
                            style={inputStyle}
                            aria-label="場所を検索"
                        />
                        <motion.button
                            type="button"
                            whileTap={reduce ? undefined : { scale: 0.94 }}
                            onClick={runSearch}
                            disabled={searching}
                            style={{
                                padding: "0 14px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                                background: "#C8E800", color: "#000", border: "none",
                                opacity: searching ? 0.5 : 1, cursor: searching ? "wait" : "pointer",
                            }}
                        >
                            {searching ? "..." : "検索"}
                        </motion.button>
                    </div>

                    {results.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                                onChange(p);
                                setMode("idle");
                            }}
                            style={{
                                textAlign: "left", padding: "9px 12px", borderRadius: 10,
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "#f0f0f5", fontSize: 13, cursor: "pointer",
                            }}
                        >
                            {p.name}
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginLeft: 6 }}>
                                {p.prefecture}
                            </span>
                        </button>
                    ))}
                    {searched && !searching && results.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                            該当する場所がありません。新しく登録できます。
                        </p>
                    ) : null}

                    <button
                        type="button"
                        onClick={() => setMode("create")}
                        style={{
                            alignSelf: "flex-start", marginTop: 2, padding: 0,
                            fontSize: 12, fontWeight: 700, color: "#C8E800",
                            background: "none", border: "none", cursor: "pointer",
                            textDecoration: "underline",
                        }}
                    >
                        + 新しい場所を登録する
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("idle")}
                        style={{
                            alignSelf: "flex-start", padding: 0, fontSize: 11,
                            color: "rgba(255,255,255,0.4)", background: "none",
                            border: "none", cursor: "pointer",
                        }}
                    >
                        キャンセル
                    </button>
                </>
            ) : (
                <>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="場所名（例: 市営プール）" style={inputStyle} aria-label="場所名" />
                    <select value={prefecture} onChange={(e) => setPrefecture(e.target.value)} style={inputStyle} aria-label="都道府県">
                        {ALL_PREFECTURES.map((pref) => (
                            <option key={pref} value={pref} style={{ color: "#000" }}>{pref}</option>
                        ))}
                    </select>
                    <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="住所（任意）" style={inputStyle} aria-label="住所" />
                    <details>
                        <summary style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>位置の詳細（緯度・経度）</summary>
                        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                            <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="緯度" style={inputStyle} aria-label="緯度" />
                            <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="経度" style={inputStyle} aria-label="経度" />
                        </div>
                        <select value={placeType} onChange={(e) => setPlaceType(e.target.value)} style={{ ...inputStyle, marginTop: 6 }} aria-label="場所タイプ">
                            {["facility", "park", "school", "stadium", "gym", "outdoor", "other"].map((tp) => (
                                <option key={tp} value={tp} style={{ color: "#000" }}>{tp}</option>
                            ))}
                        </select>
                    </details>

                    <div style={{ display: "flex", gap: 6 }}>
                        <motion.button
                            type="button"
                            whileTap={reduce ? undefined : { scale: 0.96 }}
                            onClick={createPlace}
                            disabled={creating || !name.trim()}
                            style={{
                                flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 12, fontWeight: 800,
                                background: "#C8E800", color: "#000", border: "none",
                                opacity: creating || !name.trim() ? 0.45 : 1,
                                cursor: creating ? "wait" : "pointer",
                            }}
                        >
                            {creating ? "登録中..." : "この場所を登録して使用"}
                        </motion.button>
                        <button
                            type="button"
                            onClick={() => setMode("idle")}
                            style={{
                                padding: "0 12px", fontSize: 12, borderRadius: 10,
                                background: "transparent", border: "1px solid rgba(255,255,255,0.18)",
                                color: "rgba(255,255,255,0.55)", cursor: "pointer",
                            }}
                        >
                            戻る
                        </button>
                    </div>
                </>
            )}

            {error ? (
                <p role="alert" style={{ margin: 0, fontSize: 11, color: "rgba(255,120,120,0.9)" }}>{error}</p>
            ) : null}
        </div>
    );
}
