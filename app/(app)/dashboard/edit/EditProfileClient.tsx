"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { UserRecord } from "@/features/auth/types";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};

// ── 地方 → 都道府県 マッピング ──
const REGIONS: Record<string, string[]> = {
    "北海道": ["北海道"],
    "東北": ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
    "関東": ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
    "中部": ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
    "近畿": ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
    "中国": ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
    "四国": ["徳島県", "香川県", "愛媛県", "高知県"],
    "九州・沖縄": ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
};

const SPORTS_BY_CATEGORY: Record<string, string[]> = {
    "球技（ゴール型）": [
        "サッカー",
        "フットサル",
        "バスケットボール",
        "ラグビー",
        "ハンドボール",
        "5人制サッカー（ブラインドサッカー）",
        "車いすバスケットボール",
        "車いすラグビー",
        "ゲートボール"
    ],

    "球技（ネット・ベース型）": [
        "テニス",
        "バレーボール",
        "バドミントン",
        "卓球",
        "野球",
        "ソフトボール",
        "車いすテニス",
        "シッティングバレーボール",
        "パラバドミントン",
        "パラ卓球",
        "クリケット",
        "セパタクロー"
    ],

    "武道・格闘技": [
        "柔道",
        "空手",
        "剣道",
        "ボクシング",
        "総合格闘技",
        "視覚障害者柔道",
        "パラテコンドー",
        "レスリング",
        "相撲"
    ],

    "陸上・水泳": [
        "陸上競技",
        "競泳",
        "マリンスポーツ",
        "パラ陸上",
        "パラ水泳",
        "パラトライアスロン",
        "トライアスロン",
        "オープンウォータースイム",
        "アクアスロン"
    ],

    "アーバン・ダンス": [
        "ダンス",
        "スケートボード",
        "クライミング",
        "車いすダンス",
        "パラクライミング",
        "パルクール",
        "フリースタイルフットボール",
        "ブレイキン（ブレイクダンス）",
        "ウォールトランポリン",
        "トリッキング"
    ],

    "ウィンター": [
        "スキー",
        "スノーボード",
        "フィギュアスケート",
        "パラアルペンスキー",
        "パラスノーボード",
        "パラクロスカントリー",
        "パラバイアスロン",
        "カーリング",
        "アイスホッケー",
        "スケルトン",
        "ボブスレー"
    ],

    "その他": [
        "eスポーツ",
        "モータースポーツ",
        "その他",
        "アーチェリー",
        "射撃",
        "サーフィン",
        "カヌー",
        "ボート",
        "馬術"
    ]
};



const TRAINER_SPORTS = ["パーソナルトレーナー", "アスレティックトレーナー", "ストレングスコーチ", "メンタルコーチ", "管理栄養士・栄養士", "理学療法士・柔道整復師", "ヨガ・ピラティスインストラクター", "スキルコーチ（競技特化）", "その他"];
const MEMBERS_SPORTS = ["スポンサー獲得支援", "メディア露出・PR支援", "セカンドキャリア支援", "イベント・合宿誘致", "SNS運用・ブランディング", "地方創生・行政連携", "ファンコミュニティ運営", "商品開発・コラボ支援", "資金調達・助成金サポート", "その他"];
const BUSINESS_SPORTS = ["飲食", "ジム・フィットネス", "整体・治療・医療", "美容・健康", "アパレル・雑貨", "IT・システム開発", "広告・マーケティング", "教育・スクール", "不動産・建設", "イベント・興行", "メーカー・製造", "金融・保険", "士業", "コンサルティング", "その他"];

const STANCE: Record<string, string[]> = {
    Athlete: ["競技力向上に集中", "大会・シーズン重視", "基礎づくり・育成", "挑戦・ステップアップ"],
    Trainer: ["長期伴走型", "単発サポート", "予防・基礎重視", "パフォーマンス重視"],
    Members: ["応援・参加が中心", "人をつなぐのが好き", "情報発信・拡散", "イベント・現場参加"],
    Business: ["スポーツ支援・応援", "ブランディング", "地域貢献・CSR", "共創・つながり"],
};

const BIO_PLACEHOLDER: Record<string, string> = {
    Athlete: "例）今シーズンの目標",
    Trainer: "例）怪我予防を第一にしています",
    Members: "例）地域スポーツを盛り上げたい",
    Business: "例）若手選手を応援したい",
};

export function EditProfileClient({ user, onBack }: { user: UserRecord; onBack?: () => void }) {
    const router = useRouter();
    const role = user.role;
    const rl = ROLE_COLOR[role] ?? "#a78bfa";

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    const [displayName, setDisplayName] = useState(user.displayName ?? "");
    const [bio, setBio] = useState(user.bio ?? "");
    const [region, setRegion] = useState(user.region ?? "");
    const [prefecture, setPrefecture] = useState(user.prefecture ?? "");
    const [sportsCategory, setSportsCategory] = useState(user.sportsCategory ?? "");
    const [sport, setSport] = useState(user.sport ?? "");
    const [stance, setStance] = useState(user.stance ?? "");
    const [instagram, setInstagram] = useState(user.instagram ?? "");
    const [xUrl, setXUrl] = useState(user.xUrl ?? "");
    const [tiktok, setTiktok] = useState(user.tiktok ?? "");
    const [isPublic, setIsPublic] = useState<boolean>(user.isPublic !== false);

    // Cloudinary upload
    const [profileImageUrl, setProfileImageUrl] = useState(user.profileImageUrl ?? "");
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const profileInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const prefectures = region ? REGIONS[region] ?? [] : [];
    const sportOptions = role === "Athlete"
        ? (sportsCategory ? SPORTS_BY_CATEGORY[sportsCategory] ?? [] : [])
        : role === "Trainer" ? TRAINER_SPORTS
            : role === "Members" ? MEMBERS_SPORTS
                : BUSINESS_SPORTS;

    // ── Cloudinary upload ──
    async function uploadToCloudinary(file: File): Promise<string> {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "vizion");
        const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: fd });
        const data = await res.json();
        if (!data.secure_url) throw new Error("Upload failed");
        return data.secure_url;
    }

    async function handleImageUpload(type: "profile" | "avatar") {
        const inputMap = { profile: profileInputRef, avatar: avatarInputRef };
        const input = inputMap[type]?.current;
        const file = input?.files?.[0];
        if (!file) return;
        if (type === "profile") setUploadingProfile(true);
        else if (type === "avatar") setUploadingAvatar(true);
        try {
            const url = await uploadToCloudinary(file);
            if (type === "profile") setProfileImageUrl(url);
            else if (type === "avatar") setAvatarUrl(url);
        } catch {
            setError("画像のアップロードに失敗しました");
        } finally {
            if (type === "profile") setUploadingProfile(false);
            else if (type === "avatar") setUploadingAvatar(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        setError("");
        try {
            const res = await fetch("/api/profile/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName, bio, region, prefecture,
                    sportsCategory, sport, stance,
                    instagram, xUrl, tiktok,
                    profileImageUrl, avatarUrl, isPublic,
                }),
            });
            if (!res.ok) throw new Error("保存に失敗しました");
            setSaved(true);
            setTimeout(() => { setSaved(false); onBack ? onBack() : router.push("/dashboard"); }, 1500);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "エラーが発生しました");
        } finally {
            setSaving(false);
        }
    }

    // ── UI helpers ──
    const t = { bg: "#07070e", surface: "#0d0d1a", border: "rgba(255,255,255,0.07)", text: "#fff", sub: "rgba(255,255,255,0.45)" };

    const field = (label: string, children: React.ReactNode) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: t.sub, letterSpacing: "0.05em" }}>{label}</label>
            {children}
        </div>
    );

    const input = (value: string, onChange: (v: string) => void, placeholder = "", disabled = false) => (
        <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            style={{
                width: "100%", padding: "10px 12px", borderRadius: "10px",
                background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${t.border}`, color: disabled ? t.sub : t.text,
                fontSize: "13px", outline: "none",
            }}
        />
    );

    const select = (value: string, onChange: (v: string) => void, options: string[], placeholder = "選択してください", ariaLabel = "選択") => (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            aria-label={ariaLabel}
            style={{
                width: "100%", padding: "10px 12px", borderRadius: "10px",
                background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`,
                color: value ? t.text : t.sub, fontSize: "13px", outline: "none",
                appearance: "none",
            }}
        >
            <option value="">{placeholder}</option>
            {options.map(o => <option key={o} value={o} style={{ background: "#111" }}>{o}</option>)}
        </select>
    );

    const sectionTitle = (text: string) => (
        <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: t.sub, margin: "0 0 14px", opacity: 0.55 }}>{text}</p>
    );

    const card = (children: React.ReactNode) => (
        <div style={{ borderRadius: "16px", padding: "20px", background: t.surface, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: "16px" }}>
            {children}
        </div>
    );

    const imageUploadBlock = (
        label: string,
        type: "profile" | "avatar" | "card",
        currentUrl: string,
        inputRef: React.RefObject<HTMLInputElement | null>,
        uploading: boolean,
        isRound = false,
    ) => (
        field(label,
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "12px", overflow: "hidden", background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {currentUrl
                        ? <img src={currentUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : isRound
                            ? <span style={{ fontSize: "22px", color: `${rl}60` }}>
                                {(user.displayName ?? "?").slice(0, 1).toUpperCase()}
                            </span>
                            : <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 10.5h.008v.008H13.5V10.5z" /></svg>
                    }
                </div>
                <div style={{ flex: 1 }}>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={() => {
                            if (type === "profile" || type === "avatar") {
                                handleImageUpload(type);
                            }
                        }}
                        aria-label={`${label} を選択`}
                    />
                    <button
                        onClick={() => inputRef.current?.click()}
                        disabled={uploading}
                        style={{ padding: "8px 16px", borderRadius: "9px", border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.05)", color: t.text, fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                    >
                        {uploading ? "アップロード中..." : "画像を選択"}
                    </button>
                    {type === "card" && <p>推奨: 1600×900px, 5MB以内</p>}
                    {type === "profile" && <p>カード背景・公開プロフィールのヒーロー画像</p>}
                    {type === "avatar" && <p>アイコン写真（正方形推奨）</p>}
                </div>
            </div>
        )
    );

    return (
        <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
            {/* Header */}
            <div style={{ position: "sticky", top: 0, zIndex: 30, padding: "14px 20px", background: "rgba(7,7,14,0.95)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
                <button onClick={() => onBack ? onBack() : router.back()} title="戻る"
                    style={{ padding: "7px", borderRadius: "9px", background: "rgba(255,255,255,0.06)", border: `1px solid ${t.border}`, cursor: "pointer", display: "flex" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <h1 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>プロフィール編集</h1>
                <span style={{ marginLeft: "auto", fontSize: "9px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px", background: `${rl}15`, color: rl, border: `1px solid ${rl}30` }}>
                    {role.toUpperCase()}
                </span>
            </div>

            <div style={{ maxWidth: "640px", margin: "0 auto", padding: "28px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* 画像 */}
                {card(<>
                    {sectionTitle("Images")}
                    {imageUploadBlock("カード背景画像", "profile", profileImageUrl, profileInputRef, uploadingProfile, false)}
                    {imageUploadBlock("アイコン写真（正方形推奨）", "avatar", avatarUrl, avatarInputRef, uploadingAvatar, true)}
                </>)}


                {/* 基本情報 */}
                {card(<>
                    {sectionTitle("Basic Info")}
                    {field("名前（変更不可）", input(user.displayName, () => { }, "", true))}
                    {field("表示名（アカウント名）", input(displayName, setDisplayName, "Taro Yamada"))}
                    {field("ひとこと（40文字以内）",
                        <div style={{ position: "relative" }}>
                            <textarea
                                value={bio}
                                onChange={e => setBio(e.target.value.slice(0, 40))}
                                placeholder={BIO_PLACEHOLDER[role] ?? ""}
                                rows={2}
                                style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, color: t.text, fontSize: "13px", outline: "none", resize: "none", fontFamily: "inherit" }}
                            />
                            <span style={{ position: "absolute", bottom: "8px", right: "10px", fontSize: "9px", color: t.sub, opacity: 0.4 }}>{bio.length}/40</span>
                        </div>
                    )}
                </>)}

                {/* 活動エリア */}
                {card(<>
                    {sectionTitle("Area")}
                    {field("活動エリア（地方）", select(region, (v) => { setRegion(v); setPrefecture(""); }, Object.keys(REGIONS), "選択してください", "活動エリア"))}
                    {region && field("都道府県（一度設定すると変更不可）",
                        user.prefecture
                            ? input(user.prefecture, () => { }, "", true)
                            : select(prefecture, setPrefecture, prefectures, "選択してください", "都道府県")
                    )}
                </>)}

                {/* 競技 / 専門 */}
                {card(<>
                    {sectionTitle(role === "Athlete" ? "Sport" : role === "Trainer" ? "Specialty" : role === "Business" ? "Industry" : "Area")}
                    {role === "Athlete" && field("カテゴリー", select(sportsCategory, (v) => { setSportsCategory(v); setSport(""); }, Object.keys(SPORTS_BY_CATEGORY), "選択してください", "スポーツカテゴリー"))}
                    {field(
                        role === "Athlete" ? "競技名" : role === "Trainer" ? "指導専門領域" : role === "Business" ? "業種" : "支援可能領域",
                        select(sport, setSport, sportOptions, "選択してください", role === "Athlete" ? "競技名" : role === "Trainer" ? "指導専門領域" : role === "Business" ? "業種" : "支援可能領域")
                    )}
                    {field(
                        role === "Athlete" ? "今の注力テーマ" : role === "Trainer" ? "指導スタンス" : role === "Business" ? "関わりたい目的" : "関わりたいスタンス",
                        select(stance, setStance, STANCE[role] ?? [], "選択してください", role === "Athlete" ? "今の注力テーマ" : role === "Trainer" ? "指導スタンス" : role === "Business" ? "関わりたい目的" : "関わりたいスタンス")
                    )}
                </>)}

                {/* SNS */}
                {card(<>
                    {sectionTitle("SNS Links")}
                    {field("X（旧Twitter）URL", input(xUrl, setXUrl, "https://x.com/username"))}
                    {field("Instagram URL", input(instagram, setInstagram, "https://instagram.com/username"))}
                    {field("TikTok URL", input(tiktok, setTiktok, "https://tiktok.com/@username"))}
                </>)}

                {/* ── Privacy ── */}
                {card(<>
                    {sectionTitle("Privacy")}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: t.text }}>
                                プロフィールを公開する
                            </span>
                            <span style={{ fontSize: "11px", color: t.sub }}>
                                {isPublic
                                    ? "現在公開中 — 誰でも閲覧できます"
                                    : "現在非公開 — 自分のみ確認できます"}
                            </span>
                        </div>
                        {/* トグルスイッチ */}
                        <button
                            onClick={() => setIsPublic(v => !v)}
                            aria-label="プロフィール公開設定"
                            style={{
                                position: "relative",
                                width: "48px", height: "28px",
                                borderRadius: "14px",
                                background: isPublic ? rl : "rgba(255,255,255,0.1)",
                                border: "none", cursor: "pointer",
                                transition: "background 0.2s",
                                flexShrink: 0, padding: 0,
                            }}
                        >
                            <span style={{
                                position: "absolute",
                                top: "3px",
                                left: isPublic ? "23px" : "3px",
                                width: "22px", height: "22px",
                                borderRadius: "50%",
                                background: "#fff",
                                transition: "left 0.2s",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                            }} />
                        </button>
                    </div>
                    {/* 非公開時の警告 */}
                    {!isPublic && (
                        <div style={{
                            padding: "10px 12px", borderRadius: "9px",
                            background: "rgba(255,200,30,0.06)",
                            border: "1px solid rgba(255,200,30,0.15)",
                            fontSize: "11px", color: "rgba(255,200,30,0.7)", lineHeight: 1.6,
                        }}>
                            ⚠ 非公開中は プロフィールページ と カードページ が閲覧不可になります。紹介リンクも機能しません。
                        </div>
                    )}
                </>)}

                {/* Error */}
                {error && (
                    <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", color: "#ff5050", fontSize: "12px" }}>
                        {error}
                    </div>
                )}

                {/* Save button */}
                <motion.button
                    onClick={handleSave}
                    disabled={saving || saved}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        width: "100%", padding: "14px", borderRadius: "12px",
                        background: saved ? "rgba(50,210,120,0.12)" : rl,
                        color: saved ? "#32D278" : "#000",
                        border: saved ? "1px solid rgba(50,210,120,0.3)" : "none",
                        fontSize: "14px", fontWeight: 800, cursor: saving ? "not-allowed" : "pointer",
                        letterSpacing: "0.05em", transition: "all 0.3s",
                        opacity: saving ? 0.7 : 1,
                    }}
                >
                    {saved ? "✓ 保存しました" : saving ? "保存中..." : "プロフィールを保存"}
                </motion.button>

                <div style={{ height: "40px" }} />
            </div>
        </div>
    );
}