// components/layout/FooterLight.tsx

"use client";

import Link from "next/link";
import Image from "next/image";

export function FooterLight() {
    return (
        <footer className="border-t border-black/8 px-5 pt-10 pb-8 md:px-10 lg:px-16 xl:px-20">
            <div className="mx-auto max-w-[1400px]">

                {/* Links */}
                <div className="mb-10 flex flex-col gap-8 border-b border-black/6 pb-10 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-wrap gap-x-10 gap-y-6">
                        <div className="flex flex-col gap-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/25">
                                Service
                            </p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
                                {[
                                    { href: "/register", label: "先行登録" },
                                    { href: "/business", label: "Business登録" },
                                ].map(({ href, label }) => (
                                    <Link key={href} href={href} className="vc-light-link">
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-black/25">
                                Company
                            </p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
                                <Link href="/company" className="vc-light-link">
                                    運営会社
                                </Link>
                                <a href="https://tarry-plywood-9b9.notion.site/Vizion-Connection-287089f25fae80569ec8f5263bbc6fd2?source=copy_link"
                                    target="_blank" rel="noopener noreferrer"
                                    className="vc-light-link">
                                    利用規約
                                </a>
                                <a href="https://tarry-plywood-9b9.notion.site/287089f25fae80e8a771d66b1ee4fa82?source=copy_link"
                                    target="_blank" rel="noopener noreferrer"
                                    className="vc-light-link">
                                    プライバシーポリシー
                                </a>
                                <Link href="/contact" className="vc-light-link">
                                    お問い合わせ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-end">
                    <div>
                        <Image
                            src="/images/Vizion_Connection_logo-bk.png"
                            alt="Logo"
                            width={320}
                            height={80}
                            className="h-20 w-auto"
                            onError={(e) => {
                                const target = e.target as unknown as HTMLImageElement;
                                target.style.display = "none";
                                target.insertAdjacentHTML(
                                    "afterend",
                                    '<span style="font-size:18px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:#1d1d1f;">VIZION CONNECTION</span>'
                                );
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link href="/register"
                            className="inline-block rounded-[4px] bg-[#1d1d1f] px-6 py-3 text-center text-[12px] font-black uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-80">
                            今すぐ先行登録する
                        </Link>
                        <Link href="/business"
                            className="inline-block rounded-[4px] border border-[#007aff] px-6 py-3 text-center text-[12px] font-black uppercase tracking-[0.15em] text-[#007aff] transition-all hover:bg-[#007aff] hover:text-white">
                            Business登録はこちら
                        </Link>
                    </div>
                </div>

                <div className="mt-12 border-t border-black/6 pt-8">
                    <p className="text-center text-[10px] tracking-wider text-black/20">
                        © {new Date().getFullYear()} VIZION CONNECTION. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </footer>
    );
}
