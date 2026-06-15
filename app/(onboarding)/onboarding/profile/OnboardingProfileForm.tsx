"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadImageToSupabase } from "@/lib/supabase/upload-image";
import { validateImageFile, blobToUploadFile } from "@/features/media";
import AvatarCropModal from "@/components/profile/AvatarCropModal";

// ── Sports master data ──────────────────────────────────────────────────────

const CUSTOM_SPORT_OPTION = "その他（自由入力）";

const SPORTS_BY_CATEGORY: Record<string, string[]> = {
  球技: ["サッカー", "フットサル", "野球", "ソフトボール", "バスケットボール", "バレーボール", "テニス", "卓球", "バドミントン", "ラグビー", "アメリカンフットボール", "ゴルフ", "ハンドボール", "ラクロス", "ホッケー", "クリケット", "ゲートボール", "その他（自由入力）"],
  格闘技: ["柔道", "剣道", "空手", "ボクシング", "レスリング", "テコンドー", "MMA", "ムエタイ", "合気道", "相撲", "フェンシング", "その他（自由入力）"],
  陸上: ["短距離走", "中距離走", "長距離走", "マラソン", "ハードル", "走り幅跳び", "走り高跳び", "棒高跳び", "砲丸投げ", "やり投げ", "ハンマー投げ", "競歩", "トレイルラン", "その他（自由入力）"],
  水泳: ["競泳", "水球", "飛び込み", "アーティスティックスイミング", "オープンウォーター", "その他（自由入力）"],
  体操: ["体操競技", "新体操", "トランポリン", "アクロバット", "その他（自由入力）"],
  ウィンタースポーツ: ["アルペンスキー", "クロスカントリースキー", "スキージャンプ", "スノーボード", "スピードスケート", "フィギュアスケート", "アイスホッケー", "カーリング", "その他（自由入力）"],
  フィットネス: ["筋力トレーニング", "ボディメイク", "フィジーク", "ボディビル", "クロスフィット", "ヨガ", "ピラティス", "その他（自由入力）"],
  eスポーツ: ["FPS", "MOBA", "格闘ゲーム", "スポーツゲーム", "TCG", "その他（自由入力）"],
  アーバンスポーツ: ["BMX", "パルクール", "ブレイキン", "インラインスケート", "スクーター", "その他（自由入力）"],
  その他: ["自転車競技", "ヨット", "カヌー", "馬術", "アーチェリー", "射撃", "トライアスロン", "サーフィン", "スケートボード", "クライミング", "ダンス", "チアリーディング", "ボウリング", "ダーツ", "ビリヤード", "その他（自由入力）"],
};

const PREFECTURES_BY_REGION: Record<string, string[]> = {
    北海道: ["北海道"],
    東北: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
    関東: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
    中部: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
    近畿: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
    "中国・四国": ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"],
    "九州・沖縄": ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
};

// ── Shared styles ───────────────────────────────────────────────────────────

const INPUT_BASE: React.CSSProperties = {
    width: "100%",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
    color: "var(--foreground)",
    background: "var(--surface-3)",
    border: "1px solid rgba(255,255,255,0.1)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
    caretColor: "var(--electric)",
};

const SELECT_BASE: React.CSSProperties = {
    ...INPUT_BASE,
    appearance: "none",
    cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: 36,
    background: "var(--surface-3)",
};

const CARD: React.CSSProperties = {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    padding: 16,
    marginBottom: 12,
};

const SECTION_LABEL: React.CSSProperties = {
    margin: "0 0 14px",
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
};

const FIELD_LABEL: React.CSSProperties = {
    margin: "0 0 6px",
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.38)",
    display: "flex",
    alignItems: "center",
    gap: 4,
};

// ── Sub-components ──────────────────────────────────────────────────────────

function Label({ text, required }: { text: string; required?: boolean }) {
    return (
        <p style={FIELD_LABEL}>
            {text}
            {required && <span style={{ color: "#f87171", fontSize: 11 }}>*</span>}
            {!required && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>任意</span>}
        </p>
    );
}

// ── Main component ──────────────────────────────────────────────────────────

export default function OnboardingProfileForm() {
    const router = useRouter();

    const [displayName, setDisplayName] = useState("");
    const [sportsCategory, setSportsCategory] = useState("");
    const [sport, setSport] = useState("");
    const [customSport, setCustomSport] = useState("");
    const [region, setRegion] = useState("");
    const [prefecture, setPrefecture] = useState("");
    const [location, setLocation] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingProfile, setUploadingProfile] = useState(false);
    const [avatarError, setAvatarError] = useState("");
    const [profileError, setProfileError] = useState("");
    const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);

    const sports = sportsCategory ? (SPORTS_BY_CATEGORY[sportsCategory] ?? []) : [];
    const prefectures = region ? (PREFECTURES_BY_REGION[region] ?? []) : [];
    const isCustomSportSelected = sport === CUSTOM_SPORT_OPTION;
    const resolvedSport = isCustomSportSelected ? customSport.trim() : sport;
    const isValid = Boolean(displayName.trim() && sportsCategory && resolvedSport && region && prefecture);

    function handleSportsCategoryChange(v: string) {
        setSportsCategory(v);
        setSport("");
        setCustomSport("");
    }

    function handleRegionChange(v: string) {
        setRegion(v);
        setPrefecture("");
    }

    async function handleImageUpload(type: "avatar" | "profile") {
        const input = type === "avatar" ? avatarInputRef.current : profileInputRef.current;
        const file = input?.files?.[0];
        if (!file) return;

        const setErr = type === "avatar" ? setAvatarError : setProfileError;
        const setUploading = type === "avatar" ? setUploadingAvatar : setUploadingProfile;

        setErr("");
        if (!file.type.startsWith("image/")) { setErr("画像ファイルを選択してください"); if (input) input.value = ""; return; }
        if (file.size > 5 * 1024 * 1024) { setErr("5MB以内の画像を選択してください"); if (input) input.value = ""; return; }

        setUploading(true);
        try {
            const url = await uploadImageToSupabase(file, type === "profile" ? "profile" : "avatar");
            if (type === "avatar") setAvatarUrl(url);
            else setProfileImageUrl(url);
        } catch (e) {
            setErr(e instanceof Error ? e.message : "アップロードに失敗しました");
        } finally {
            setUploading(false);
            if (input) input.value = "";
        }
    }

    // アバターはアップロード前に Crop Editor を経由する
    function handleAvatarPick() {
        const input = avatarInputRef.current;
        const file = input?.files?.[0];
        if (!file) return;
        setAvatarError("");
        const validation = validateImageFile(file, { maxBytes: 5 * 1024 * 1024 });
        if (!validation.ok) {
            setAvatarError(validation.error ?? "画像ファイルを選択してください");
            input!.value = "";
            return;
        }
        setAvatarCropSrc(URL.createObjectURL(file));
        input!.value = "";
    }

    function closeAvatarCrop() {
        if (uploadingAvatar) return;
        setAvatarCropSrc((prev) => {
            if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
            return null;
        });
    }

    async function handleAvatarCropped(blob: Blob) {
        setUploadingAvatar(true);
        setAvatarError("");
        try {
            const url = await uploadImageToSupabase(blobToUploadFile(blob, "avatar"), "avatar");
            setAvatarUrl(url);
            setAvatarCropSrc((prev) => {
                if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                return null;
            });
        } catch (e) {
            setAvatarError(e instanceof Error ? e.message : "アップロードに失敗しました");
        } finally {
            setUploadingAvatar(false);
        }
    }

    async function handleSubmit() {
        if (!isValid || saving) return;
        setSaving(true);
        setFormError("");
        try {
            const res = await fetch("/api/profile/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: displayName.trim(),
                    sportsCategory,
                    sport: resolvedSport,
                    region,
                    prefecture,
                    ...(location.trim() ? { location: location.trim() } : {}),
                    ...(avatarUrl ? { avatarUrl } : {}),
                    ...(profileImageUrl ? { profileImageUrl } : {}),
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({})) as { error?: string };
                setFormError(data.error ?? "保存に失敗しました");
                return;
            }
            await fetch("/api/onboarding/complete", { method: "POST" });
            router.push("/onboarding/day0");
        } catch {
            setFormError("ネットワークエラーが発生しました");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

            {/* ── Scrollable content ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 8px", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>

                {/* Header */}
                <div style={{ textAlign: "center", padding: "22px 4px 20px" }}>
                    <h1 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.3 }}>
                        基本情報を登録しましょう
                    </h1>
                    <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
                        約2〜3分で完了します。あとでいつでも変更できます。
                    </p>
                </div>

                {/* ① 表示名 */}
                <div style={CARD}>
                    <p style={SECTION_LABEL}>プロフィール</p>
                    <Label text="表示名" required />
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="例：山田 太郎"
                        maxLength={40}
                        style={INPUT_BASE}
                    />
                </div>

                {/* ② ③ スポーツ */}
                <div style={CARD}>
                    <p style={SECTION_LABEL}>活動・競技</p>
                    <div style={{ marginBottom: 12 }}>
                        <Label text="スポーツカテゴリー" required />
                        <select value={sportsCategory} onChange={(e) => handleSportsCategoryChange(e.target.value)} style={SELECT_BASE}>
                            <option value="">選択してください</option>
                            {Object.keys(SPORTS_BY_CATEGORY).map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label text="競技・種目" required />
                        <select
                            value={sport}
                            onChange={(e) => {
                                const nextSport = e.target.value;
                                setSport(nextSport);
                                if (nextSport !== CUSTOM_SPORT_OPTION) {
                                    setCustomSport("");
                                }
                            }}
                            disabled={!sportsCategory}
                            style={{ ...SELECT_BASE, opacity: sportsCategory ? 1 : 0.45 }}
                        >
                            <option value="">{sportsCategory ? "選択してください" : "カテゴリーを先に選択"}</option>
                            {sports.map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                        {isCustomSportSelected ? (
                            <div style={{ marginTop: 12 }}>
                                <Label text="競技名を入力" required />
                                <input
                                    type="text"
                                    value={customSport}
                                    onChange={(e) => setCustomSport(e.target.value)}
                                    placeholder="例：カバディ"
                                    maxLength={40}
                                    style={INPUT_BASE}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* ④ ⑤ ⑥ エリア */}
                <div style={CARD}>
                    <p style={SECTION_LABEL}>活動エリア</p>
                    <div style={{ marginBottom: 12 }}>
                        <Label text="地方" required />
                        <select value={region} onChange={(e) => handleRegionChange(e.target.value)} style={SELECT_BASE}>
                            <option value="">選択してください</option>
                            {Object.keys(PREFECTURES_BY_REGION).map((r) => (<option key={r} value={r}>{r}</option>))}
                        </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <Label text="都道府県" required />
                        <select
                            value={prefecture}
                            onChange={(e) => setPrefecture(e.target.value)}
                            disabled={!region}
                            style={{ ...SELECT_BASE, opacity: region ? 1 : 0.45 }}
                        >
                            <option value="">{region ? "選択してください" : "地方を先に選択"}</option>
                            {prefectures.map((p) => (<option key={p} value={p}>{p}</option>))}
                        </select>
                    </div>
                    <div>
                        <Label text="活動拠点" />
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="例：東京都渋谷区・オンライン"
                            maxLength={80}
                            style={INPUT_BASE}
                        />
                    </div>
                </div>

                {/* ⑦ ⑧ 写真 */}
                <div style={CARD}>
                    <p style={SECTION_LABEL}>写真</p>

                    <AvatarCropModal
                        isOpen={avatarCropSrc !== null}
                        src={avatarCropSrc}
                        onClose={closeAvatarCrop}
                        onComplete={(blob) => void handleAvatarCropped(blob)}
                        busy={uploadingAvatar}
                    />

                    {/* アカウント写真 */}
                    <div style={{ marginBottom: 18 }}>
                        <Label text="アカウント写真" />
                        <p style={{ margin: "0 0 10px", fontSize: 11, color: "rgba(255,255,255,0.28)" }}>後でも設定できます</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.25)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {avatarUrl
                                    ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <span style={{ fontSize: 22 }}>👤</span>}
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <input ref={avatarInputRef} type="file" accept="image/*" aria-label="アカウント写真を選択" style={{ display: "none" }} onChange={handleAvatarPick} />
                                <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
                                    style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                    {uploadingAvatar ? "アップロード中..." : "画像を選択"}
                                </button>
                                {avatarUrl && (
                                    <button type="button" onClick={() => { setAvatarUrl(""); setAvatarError(""); }}
                                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.38)", fontSize: 12, cursor: "pointer" }}>
                                        削除
                                    </button>
                                )}
                            </div>
                        </div>
                        {avatarError && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#f87171" }}>{avatarError}</p>}
                    </div>

                    {/* プロフィールカード写真 */}
                    <div>
                        <Label text="プロフィールカード写真" />
                        <p style={{ margin: "0 0 10px", fontSize: 11, color: "rgba(255,255,255,0.28)" }}>後でも設定できます</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ flexShrink: 0, width: 88, height: 50, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.25)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {profileImageUrl
                                    ? <img src={profileImageUrl} alt="card" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <span style={{ fontSize: 18 }}>🖼️</span>}
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <input ref={profileInputRef} type="file" accept="image/*" aria-label="プロフィールカード写真を選択" style={{ display: "none" }} onChange={() => void handleImageUpload("profile")} />
                                <button type="button" onClick={() => profileInputRef.current?.click()} disabled={uploadingProfile}
                                    style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                    {uploadingProfile ? "アップロード中..." : "画像を選択"}
                                </button>
                                {profileImageUrl && (
                                    <button type="button" onClick={() => { setProfileImageUrl(""); setProfileError(""); }}
                                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.38)", fontSize: 12, cursor: "pointer" }}>
                                        削除
                                    </button>
                                )}
                            </div>
                        </div>
                        {profileError && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#f87171" }}>{profileError}</p>}
                    </div>
                </div>

                {formError && (
                    <div style={{ marginBottom: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", fontSize: 13, color: "#fca5a5" }}>
                        {formError}
                    </div>
                )}
            </div>

            {/* ── Fixed footer ── */}
            <div style={{ flexShrink: 0, padding: "12px 20px", paddingBottom: "calc(12px + env(safe-area-inset-bottom))", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0B0B0F" }}>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isValid || saving}
                    className={isValid && !saving ? "hover:brightness-110" : ""}
                    style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: 14,
                        border: "none",
                        background: isValid ? "#7c3aed" : "rgba(255,255,255,0.07)",
                        color: isValid ? "#fff" : "rgba(255,255,255,0.25)",
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: isValid && !saving ? "pointer" : "not-allowed",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        letterSpacing: "0.04em",
                    }}
                >
                    {saving ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            登録中...
                        </>
                    ) : "登録して始める"}
                </button>
                <div style={{ textAlign: "center", marginTop: 14 }}>
                    <button
                        type="button"
                        onClick={() => window.location.assign("/dashboard")}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: 12, cursor: "pointer", padding: "4px 8px" }}
                    >
                        後にする
                    </button>
                </div>
            </div>
        </div>
    );
}
