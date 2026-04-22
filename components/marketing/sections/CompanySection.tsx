import Link from "next/link";
// components/marketing/sections/CompanySection.tsx

export function CompanySection() {
    return (
        <div className="min-h-screen bg-[#07070e] text-white flex items-center justify-center px-6 py-24">
            <div className="w-full max-w-2xl space-y-16">

                {/* ヘッダー */}
                <div className="space-y-2">
                    <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
                        Company
                    </p>
                    <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
                        運営会社
                    </h1>
                </div>

                {/* 会社情報テーブル */}
                <div style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden" }}>
                    {[
                        { label: "屋号", value: "OnRoots" },
                        { label: "代表者", value: "Hiromasa Kurokawa" },
                        { label: "事業形態", value: "個人事業主" },
                        { label: "所在地", value: "神奈川県横浜市" },
                        { label: "事業内容", value: "スポーツ特化型SNSプラットフォームの開発・運営" },
                    ].map(({ label, value }, i, arr) => (
                        <div key={label} style={{
                            display: "flex", alignItems: "flex-start", gap: "24px",
                            padding: "18px 28px",
                            borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                        }}>
                            <span style={{ width: "100px", flexShrink: 0, fontSize: "11px", color: "rgba(255,255,255,0.35)", paddingTop: "1px" }}>
                                {label}
                            </span>
                            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* お問い合わせ */}
                <div style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: "16px", padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <div>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>お問い合わせ</p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
                            広告・取材・不具合などはこちらから
                        </p>
                    </div>
                    <a href="/contact" style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "10px 20px", borderRadius: "10px",
                        background: "#a78bfa", color: "#000",
                        fontSize: "13px", fontWeight: 700, textDecoration: "none",
                        whiteSpace: "nowrap",
                    }}>
                        お問い合わせはこちら
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>

                {/* 戻るリンク */}
                <div>
                    <Link href="/" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
                        ← トップに戻る
                    </Link>
                </div>

            </div>
        </div>
    );
}