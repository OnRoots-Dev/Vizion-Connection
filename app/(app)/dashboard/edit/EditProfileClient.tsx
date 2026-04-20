"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { UserRecord } from "@/features/auth/types";
import { uploadImageToSupabase } from "@/lib/supabase/upload-image";

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#FF5050", Trainer: "#32D278", Members: "#FFC81E", Business: "#3C8CFF",
};

const REGIONS: Record<string, string[]> = {
    "北海道": ["北海道"],
    "東北": ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
    "関東": ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
    "中部": ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
    "近畿": ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
    "中国・四国": ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"],
    "九州・沖縄": ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
};

const SPORTS_BY_CATEGORY: Record<string, string[]> = {
    "球技（ゴール型）": ["サッカー", "フットサル", "バスケットボール", "ラグビー", "ハンドボール", "5人制サッカー（ブラインドサッカー）", "車いすバスケットボール", "車いすラグビー", "ゲートボール"],
    "球技（ネット・ベース型）": ["テニス", "バレーボール", "バドミントン", "卓球", "野球", "ソフトボール", "車いすテニス", "シッティングバレーボール", "パラバドミントン", "パラ卓球", "クリケット", "セパタクロー"],
    "武道・格闘技": ["柔道", "空手", "剣道", "ボクシング", "総合格闘技", "視覚障害者柔道", "パラテコンドー", "レスリング", "相撲"],
    "陸上・水泳": ["陸上競技", "競泳", "マリンスポーツ", "パラ陸上", "パラ水泳", "パラトライアスロン", "トライアスロン", "オープンウォータースイム", "アクアスロン"],
    "アーバン・ダンス": ["ダンス", "スケートボード", "クライミング", "車いすダンス", "パラクライミング", "パルクール", "フリースタイルフットボール", "ブレイキン（ブレイクダンス）", "ウォールトランポリン", "トリッキング"],
    "ウィンター": ["スキー", "スノーボード", "フィギュアスケート", "パラアルペンスキー", "パラスノーボード", "パラクロスカントリー", "パラバイアスロン", "カーリング", "アイスホッケー", "スケルトン", "ボブスレー"],
    "その他": ["eスポーツ", "モータースポーツ", "その他", "アーチェリー", "射撃", "サーフィン", "カヌー", "ボート", "馬術"],
};

const TRAINER_SPORTS = ["パーソナルトレーナー", "アスレティックトレーナー", "ストレングスコーチ", "メンタルコーチ", "管理栄養士・栄養士", "理学療法士・柔道整復師", "ヨガ・ピラティスインストラクター", "スキルコーチ（競技特化）", "その他"];
const MEMBERS_SPORTS = ["スポンサー獲得支援", "メディア露出・PR支援", "セカンドキャリア支援", "イベント・合宿誘致", "SNS運用・ブランディング", "地方創生・行政連携", "ファンコミュニティ運営", "商品開発・コラボ支援", "資金調達・助成金サポート", "その他"];
const BUSINESS_SPORTS = ["飲食", "ジム・フィットネス", "整体・治療・医療", "美容・健康", "アパレル・雑貨", "IT・システム開発", "広告・マーケティング", "教育・スクール", "不動産・建設", "イベント・興行", "メーカー・製造", "金融・保険", "士業", "コンサルティング", "その他"];

const STANCE: Record<string, string[]> = {
    Athlete: ["競技力向上に集中", "大会・シーズン重視", "基礎づくり・育成", "挑戦・ステップアップ"],
    Trainer: ["長期伴走型", "単発サポート", "予防・基礎重視", "パフォーマンス重視"],
    Members: ["応援・参加が中心", "人をつなぐのが好き", "情報発信・拡散", "イベント・現場参加"],
    Business: ["スポーツ支援・応援", "ブランディング", "地域貢献・CSR", "共創・つながり"],
    Admin: [],
};

const BIO_PLACEHOLDER: Record<string, string> = {
    Athlete: "例）今シーズンの目標",
    Trainer: "例）怪我予防を第一にしています",
    Members: "例）地域スポーツを盛り上げたい",
    Business: "例）若手選手を応援したい",
    Admin: "例）運営メッセージ",
};

const SECTION_ITEMS = [
    { id: "images", label: "画像" },
    { id: "basic", label: "基本情報" },
    { id: "area", label: "エリア" },
    { id: "activity", label: "競技・活動" },
    { id: "sns", label: "SNS" },
    { id: "privacy", label: "公開設定" },
] as const;

type SectionId = (typeof SECTION_ITEMS)[number]["id"];

export function EditProfileClient({ user, onBack, onSaved }: { user: UserRecord; onBack?: () => void; onSaved?: () => void | Promise<void> }) {
    const router = useRouter();
    const role = user.role;
    const rl = ROLE_COLOR[role] ?? "#a78bfa";
    const t = { bg: "#07070e", surface: "#0d0d1a", border: "rgba(255,255,255,0.07)", text: "#fff", sub: "rgba(255,255,255,0.45)" };

    const [activeSection, setActiveSection] = useState<SectionId>("images");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [profileImageError, setProfileImageError] = useState("");
    const [avatarImageError, setAvatarImageError] = useState("");

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

    async function handleImageUpload(type: "profile" | "avatar") {
        const input = type === "profile" ? profileInputRef.current : avatarInputRef.current;
        const file = input?.files?.[0];
        if (!file) return;

        const setUploading = type === "profile" ? setUploadingProfile : setUploadingAvatar;
        const setImage = type === "profile" ? setProfileImageUrl : setAvatarUrl;
        const setImageError = type === "profile" ? setProfileImageError : setAvatarImageError;

        setImageError("");
        setError("");

        if (!file.type.startsWith("image/")) {
            setImageError("画像ファイルを選択してください");
            if (input) input.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setImageError("画像サイズは5MB以内にしてください");
            if (input) input.value = "";
            return;
        }

        setUploading(true);
        try {
            const url = await uploadImageToSupabase(file, type);
            setImage(url);
        } catch (uploadError) {
            setImageError(uploadError instanceof Error ? uploadError.message : "画像アップロードに失敗しました");
        } finally {
            setUploading(false);
            if (input) input.value = "";
        }
    }

    async function handleSave() {
        setSaving(true);
        setSaved(false);
        setError("");
        try {
            const res = await fetch("/api/profile/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName,
                    bio,
                    region,
                    prefecture,
                    sportsCategory,
                    sport,
                    stance,
                    instagram,
                    xUrl,
                    tiktok,
                    profileImageUrl,
                    avatarUrl,
                    isPublic,
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(typeof json?.error === "string" ? json.error : "保存に失敗しました");
            }
            await onSaved?.();
            setSaved(true);
            if (!onBack && !onSaved) {
                setTimeout(() => router.push("/dashboard"), 1200);
            }
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "エラーが発生しました");
        } finally {
            setSaving(false);
        }
    }

    const field = (label: string, children: React.ReactNode) => (
        <div className="flex flex-col gap-[6px]">
            <label className="text-[11px] font-semibold tracking-[0.05em]" style={{ color: t.sub }}>{label}</label>
            {children}
        </div>
    );

    const cardClassName = "rounded-[24px] border p-5 shadow-[0_14px_50px_rgba(0,0,0,0.22)]";
    const inputClassName = "w-full rounded-[14px] border px-3 py-[11px] text-[13px] outline-none";
    const actionButtonClassName = "inline-flex items-center justify-center rounded-[12px] px-[14px] py-[10px] text-[12px] font-bold";

    const renderInput = (value: string, onChange: (v: string) => void, placeholder = "", disabled = false) => (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClassName}
            style={{
                background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)",
                borderColor: t.border,
                color: disabled ? t.sub : t.text,
            }}
        />
    );

    const renderSelect = (value: string, onChange: (v: string) => void, options: string[], placeholder = "選択してください", ariaLabel = "選択") => (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={ariaLabel}
            className={inputClassName}
            style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: t.border,
                color: value ? t.text : t.sub,
                appearance: "none",
            }}
        >
            <option value="">{placeholder}</option>
            {options.map((option) => <option key={option} value={option} style={{ background: "#111" }}>{option}</option>)}
        </select>
    );

    const imageUploadBlock = (
        label: string,
        type: "profile" | "avatar",
        currentUrl: string,
        inputRef: React.RefObject<HTMLInputElement | null>,
        uploading: boolean,
        imageError: string,
        description: string,
    ) => (
        <div className="flex flex-col gap-3 rounded-[18px] border p-4" style={{ borderColor: t.border, background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center gap-3">
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] border" style={{ borderColor: t.border, background: "rgba(255,255,255,0.05)" }}>
                    {currentUrl ? <img src={currentUrl} alt={label} className="h-full w-full object-cover" /> : (
                        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 10.5h.008v.008H13.5V10.5z" />
                        </svg>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="mb-1 mt-0 text-[13px] font-bold" style={{ color: t.text }}>{label}</p>
                    <p className="m-0 text-[11px] leading-[1.6]" style={{ color: t.sub }}>{description}</p>
                </div>
            </div>

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={() => void handleImageUpload(type)} aria-label={`${label}を選択`} />

            <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className={actionButtonClassName} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${t.border}`, color: t.text, cursor: uploading ? "wait" : "pointer" }}>
                    {uploading ? "アップロード中..." : "画像を選択"}
                </button>
                {currentUrl ? (
                    <button
                        type="button"
                        onClick={() => {
                            if (type === "profile") {
                                setProfileImageUrl("");
                                setProfileImageError("");
                            } else {
                                setAvatarUrl("");
                                setAvatarImageError("");
                            }
                        }}
                        className={actionButtonClassName}
                        style={{ background: "transparent", border: `1px solid ${t.border}`, color: t.sub }}
                    >
                        削除
                    </button>
                ) : null}
            </div>

            {imageError ? <p className="m-0 rounded-[12px] border px-3 py-[10px] text-[12px]" style={{ color: "#ff8b8b", background: "rgba(255,80,80,0.08)", borderColor: "rgba(255,80,80,0.22)" }}>{imageError}</p> : null}
        </div>
    );

    return (
        <div className="min-h-screen" style={{ background: `radial-gradient(circle at top right, ${rl}18, transparent 28%), ${t.bg}`, color: t.text }}>
            <div className="border-b backdrop-blur-[18px]" style={{ borderBottomColor: t.border, background: "rgba(7,7,14,0.84)" }}>
                <div className="mx-auto flex max-w-[1120px] items-center gap-3 px-4 py-4 md:px-6">
                    <button type="button" aria-label="戻る" title="戻る" onClick={() => onBack ? onBack() : router.back()} className="flex h-10 w-10 items-center justify-center rounded-[12px] border" style={{ borderColor: t.border, background: "rgba(255,255,255,0.05)", cursor: "pointer" }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={t.sub} strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <div>
                        <p className="mb-1 mt-0 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: `${rl}cc` }}>Profile Studio</p>
                        <h1 className="m-0 text-[18px] font-black">プロフィール設定</h1>
                    </div>
                    <span className="ml-auto rounded-full border px-3 py-[6px] text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: rl, borderColor: `${rl}35`, background: `${rl}14` }}>{role}</span>
                </div>
            </div>

            <div className="mx-auto grid max-w-[1120px] gap-6 px-4 py-6 md:grid-cols-[240px_minmax(0,1fr)] md:px-6">
                <aside className="h-fit rounded-[24px] border p-3" style={{ borderColor: t.border, background: "rgba(255,255,255,0.03)" }}>
                    <div className="mb-3 rounded-[18px] border p-4" style={{ borderColor: `${rl}24`, background: `${rl}10` }}>
                        <p className="mb-1 mt-0 text-[12px] font-black" style={{ color: t.text }}>{displayName || user.displayName}</p>
                        <p className="m-0 text-[11px]" style={{ color: t.sub }}>@{user.slug}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        {SECTION_ITEMS.map((section) => {
                            const active = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => setActiveSection(section.id)}
                                    className="flex items-center justify-between rounded-[14px] px-3 py-[11px] text-left text-[13px] font-semibold transition-all"
                                    style={{ color: active ? rl : t.sub, background: active ? `${rl}14` : "transparent", border: active ? `1px solid ${rl}2f` : "1px solid transparent", cursor: "pointer" }}
                                >
                                    <span>{section.label}</span>
                                    {active ? <span className="text-[10px] font-black">●</span> : null}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <div className="flex flex-col gap-5">
                    {activeSection === "images" ? (
                        <section className={cardClassName} style={{ borderColor: t.border, background: t.surface }}>
                            <div className="mb-5">
                                <p className="mb-2 mt-0 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: `${rl}cc` }}>Images</p>
                                <h2 className="m-0 text-[24px] font-black">画像を整える</h2>
                                <p className="mb-0 mt-2 text-[13px] leading-[1.7]" style={{ color: t.sub }}>カード背景画像とプロフィールアイコンをこの場で更新できます。画像アップロードの失敗は、それぞれの項目の直下に表示されます。</p>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-2">
                                {imageUploadBlock("カード背景画像", "profile", profileImageUrl, profileInputRef, uploadingProfile, profileImageError, "カード背景・プロフィールのヒーロー画像です。横長画像がおすすめです。")}
                                {imageUploadBlock("プロフィール画像", "avatar", avatarUrl, avatarInputRef, uploadingAvatar, avatarImageError, "アイコンとして表示される写真です。正方形に近い画像がおすすめです。")}
                            </div>
                        </section>
                    ) : null}

                    {activeSection === "basic" ? (
                        <section className={cardClassName} style={{ borderColor: t.border, background: t.surface }}>
                            <div className="mb-5">
                                <p className="mb-2 mt-0 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: `${rl}cc` }}>Basic Info</p>
                                <h2 className="m-0 text-[24px] font-black">基本情報</h2>
                            </div>
                            <div className="grid gap-4">
                                {field("名前（変更不可）", renderInput(user.displayName, () => { }, "", true))}
                                {field("表示名（アカウント名）", renderInput(displayName, setDisplayName, "Taro Yamada"))}
                                {field("ひとこと（40文字以内）", (
                                    <div className="relative">
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value.slice(0, 40))}
                                            placeholder={BIO_PLACEHOLDER[role] ?? ""}
                                            rows={3}
                                            className="min-h-[110px] w-full rounded-[14px] border px-3 py-3 text-[13px] outline-none"
                                            style={{ background: "rgba(255,255,255,0.05)", borderColor: t.border, color: t.text, resize: "none" }}
                                        />
                                        <span className="absolute bottom-[10px] right-3 text-[10px]" style={{ color: t.sub }}>{bio.length}/40</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    {activeSection === "area" ? (
                        <section className={cardClassName} style={{ borderColor: t.border, background: t.surface }}>
                            <div className="mb-5">
                                <p className="mb-2 mt-0 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: `${rl}cc` }}>Area</p>
                                <h2 className="m-0 text-[24px] font-black">活動エリア</h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {field("活動エリア（地方）", renderSelect(region, (value) => { setRegion(value); setPrefecture(""); }, Object.keys(REGIONS), "選択してください", "活動エリア"))}
                                {region ? field("都道府県", user.prefecture ? renderInput(user.prefecture, () => { }, "", true) : renderSelect(prefecture, setPrefecture, prefectures, "選択してください", "都道府県")) : null}
                            </div>
                        </section>
                    ) : null}

                    {activeSection === "activity" ? (
                        <section className={cardClassName} style={{ borderColor: t.border, background: t.surface }}>
                            <div className="mb-5">
                                <p className="mb-2 mt-0 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: `${rl}cc` }}>Activity</p>
                                <h2 className="m-0 text-[24px] font-black">競技・活動内容</h2>
                            </div>
                            <div className="grid gap-4">
                                {role === "Athlete" ? field("カテゴリー", renderSelect(sportsCategory, (value) => {
                                    setSportsCategory(value);
                                    setSport("");
                                }, Object.keys(SPORTS_BY_CATEGORY), "選択してください", "スポーツカテゴリー")) : null}

                                {role === "Athlete" ? field("競技（1つ選択）", renderSelect(sport, setSport, sportOptions, sportOptions.length === 0 ? "カテゴリーを選択してください" : "選択してください", "競技"))
                                    : field(role === "Trainer" ? "指導専門領域" : role === "Business" ? "業種" : "支援可能領域", renderSelect(sport, setSport, sportOptions, "選択してください", "競技名"))}

                                {field(role === "Athlete" ? "今の注力テーマ" : role === "Trainer" ? "指導スタンス" : role === "Business" ? "関わりたい目的" : "関わりたいスタンス", renderSelect(stance, setStance, STANCE[role] ?? [], "選択してください", "スタンス"))}
                            </div>
                        </section>
                    ) : null}

                    {activeSection === "sns" ? (
                        <section className={cardClassName} style={{ borderColor: t.border, background: t.surface }}>
                            <div className="mb-5">
                                <p className="mb-2 mt-0 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: `${rl}cc` }}>SNS</p>
                                <h2 className="m-0 text-[24px] font-black">外部リンク</h2>
                            </div>
                            <div className="grid gap-4">
                                {field("X（旧Twitter）URL", renderInput(xUrl, setXUrl, "https://x.com/username"))}
                                {field("Instagram URL", renderInput(instagram, setInstagram, "https://instagram.com/username"))}
                                {field("TikTok URL", renderInput(tiktok, setTiktok, "https://tiktok.com/@username"))}
                            </div>
                        </section>
                    ) : null}

                    {activeSection === "privacy" ? (
                        <section className={cardClassName} style={{ borderColor: t.border, background: t.surface }}>
                            <div className="mb-5">
                                <p className="mb-2 mt-0 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: `${rl}cc` }}>Privacy</p>
                                <h2 className="m-0 text-[24px] font-black">公開設定</h2>
                            </div>
                            <div className="rounded-[18px] border p-4" style={{ borderColor: t.border, background: "rgba(255,255,255,0.02)" }}>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="mb-1 mt-0 text-[14px] font-bold" style={{ color: t.text }}>プロフィールを公開する</p>
                                        <p className="m-0 text-[12px] leading-[1.7]" style={{ color: t.sub }}>
                                            {isPublic ? "現在公開中です。プロフィールページとカードページを表示できます。" : "現在非公開です。自分以外からの閲覧導線が止まります。"}
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => setIsPublic((value) => !value)} aria-label="プロフィール公開設定" className="relative h-8 w-[52px] shrink-0 rounded-full" style={{ background: isPublic ? rl : "rgba(255,255,255,0.10)", border: "none", cursor: "pointer" }}>
                                        <span className="absolute top-[3px] h-[26px] w-[26px] rounded-full bg-white transition-all" style={{ left: isPublic ? "23px" : "3px" }} />
                                    </button>
                                </div>
                                {!isPublic ? <div className="mt-4 rounded-[14px] border px-4 py-3 text-[12px] leading-[1.7]" style={{ color: "#ffcf8c", background: "rgba(255,200,30,0.06)", borderColor: "rgba(255,200,30,0.16)" }}>非公開中はプロフィールページとカードページが閲覧不可になります。紹介リンクも機能しません。</div> : null}
                            </div>
                        </section>
                    ) : null}

                    {error ? <div className="rounded-[16px] border px-4 py-3 text-[12px]" style={{ color: "#ff8b8b", background: "rgba(255,80,80,0.08)", borderColor: "rgba(255,80,80,0.22)" }}>{error}</div> : null}
                    {saved ? <div className="rounded-[16px] border px-4 py-3 text-[12px]" style={{ color: "#65e3a0", background: "rgba(50,210,120,0.08)", borderColor: "rgba(50,210,120,0.22)" }}>プロフィールを保存しました。</div> : null}

                    <div className="sticky bottom-4 flex flex-col gap-3 rounded-[22px] border p-4 backdrop-blur-[14px] sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: t.border, background: "rgba(13,13,26,0.92)" }}>
                        <div>
                            <p className="mb-1 mt-0 text-[13px] font-bold">1画面のまま編集できます</p>
                            <p className="m-0 text-[11px]" style={{ color: t.sub }}>左のセクションを切り替えながら、そのまま保存できます。</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {onBack ? <button type="button" onClick={onBack} className="rounded-[12px] border px-4 py-[11px] text-[12px] font-bold" style={{ color: t.sub, borderColor: t.border, background: "transparent" }}>戻る</button> : null}
                            <motion.button
                                type="button"
                                onClick={() => void handleSave()}
                                disabled={saving}
                                whileTap={{ scale: 0.98 }}
                                className="rounded-[12px] px-5 py-[11px] text-[13px] font-black"
                                style={{ background: saved ? "rgba(50,210,120,0.14)" : rl, color: saved ? "#65e3a0" : "#050505", border: saved ? "1px solid rgba(50,210,120,0.25)" : "none", cursor: saving ? "wait" : "pointer", opacity: saving ? 0.7 : 1 }}
                            >
                                {saving ? "保存中..." : saved ? "保存済み" : "プロフィールを保存"}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
