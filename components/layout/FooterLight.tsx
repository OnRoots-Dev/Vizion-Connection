// components/layout/FooterLight.tsx

"use client";

import Link from "next/link";

export function FooterLight() {
    return (
        <footer className="px-5 pt-10 pb-8 md:px-10 lg:px-16 xl:px-20"
            style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <div className="mx-auto max-w-[1400px]">

                {/* Links */}
                <div className="mb-10 flex flex-col gap-8 pb-10 md:flex-row md:items-start md:justify-between"
                    style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <div className="flex flex-wrap gap-x-10 gap-y-6">
                        <div className="flex flex-col gap-3">
                            <p className="text-[10px] uppercase tracking-[0.35em] font-bold"
                                style={{ color: "rgba(0,0,0,0.25)" }}>
                                Service
                            </p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
                                {[
                                    { href: "/register", label: "先行登録" },
                                    { href: "/business", label: "Business登録" },
                                    { href: "/discover", label: "Discovery" },
                                ].map(({ href, label }) => (
                                    <Link key={href} href={href}
                                        className="transition-colors"
                                        style={{ color: "rgba(0,0,0,0.45)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "#007aff")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.45)")}>
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <p className="text-[10px] uppercase tracking-[0.35em] font-bold"
                                style={{ color: "rgba(0,0,0,0.25)" }}>
                                Company
                            </p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
                                <Link href="/company" className="transition-colors"
                                    style={{ color: "rgba(0,0,0,0.45)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#007aff")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.45)")}>
                                    運営会社
                                </Link>
                                <a href="https://tarry-plywood-9b9.notion.site/Vizion-Connection-287089f25fae80569ec8f5263bbc6fd2?source=copy_link"
                                    target="_blank" rel="noopener noreferrer"
                                    className="transition-colors"
                                    style={{ color: "rgba(0,0,0,0.45)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#007aff")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.45)")}>
                                    利用規約
                                </a>
                                <a href="https://tarry-plywood-9b9.notion.site/287089f25fae80e8a771d66b1ee4fa82?source=copy_link"
                                    target="_blank" rel="noopener noreferrer"
                                    className="transition-colors"
                                    style={{ color: "rgba(0,0,0,0.45)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#007aff")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.45)")}>
                                    プライバシーポリシー
                                </a>
                                <Link href="/contact" className="transition-colors"
                                    style={{ color: "rgba(0,0,0,0.45)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "#007aff")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.45)")}>
                                    お問い合わせ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-end">
                    <div>
                        <img src="/images/Vizion_Connection_logo-bk.png" alt="Logo" className="h-20 w-auto"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                target.insertAdjacentHTML("afterend",
                                    '<span style="font-size:18px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:#1d1d1f;">VIZION CONNECTION</span>'
                                );
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link href="/register"
                            className="inline-block px-6 py-3 text-[12px] font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80 text-center"
                            style={{ background: "#1d1d1f", color: "#fff", borderRadius: "4px" }}>
                            今すぐ先行登録する
                        </Link>
                        <Link href="/business"
                            className="inline-block px-6 py-3 text-[12px] font-black uppercase tracking-[0.15em] transition-all text-center"
                            style={{ border: "1px solid #007aff", color: "#007aff", borderRadius: "4px" }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#007aff";
                                e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "#007aff";
                            }}>
                            Business登録はこちら
                        </Link>
                    </div>
                </div>

                <div className="mt-12 pt-8" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <p className="text-[10px] tracking-wider text-center"
                        style={{ color: "rgba(0,0,0,0.2)" }}>
                        © {new Date().getFullYear()} VIZION CONNECTION. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </footer>
    );
}