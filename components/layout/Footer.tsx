"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 pt-10 pb-8 md:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto">
        <div className="mb-12 flex flex-col gap-8 border-b border-white/5 pb-10 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-wrap gap-x-10 gap-y-6">
            <div className="flex flex-col gap-3">
              <p className="font-display text-[10px] uppercase tracking-[0.35em] text-white/30">Service</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 font-body text-[13px] text-white/45">
                <Link href="/register" className="hover:text-[#FFD600] transition-colors">先行登録</Link>
                <Link href="/business" className="hover:text-[#FFD600] transition-colors">Business登録</Link>
                <Link href="/discover" className="hover:text-[#FFD600] transition-colors">Discovery</Link>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-display text-[10px] uppercase tracking-[0.35em] text-white/30">Company</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 font-body text-[13px] text-white/45">
                <Link href="/company" className="hover:text-[#FFD600] transition-colors">運営会社</Link>
                <a href="https://tarry-plywood-9b9.notion.site/Vizion-Connection-287089f25fae80569ec8f5263bbc6fd2?source=copy_link" className="hover:text-[#FFD600] transition-colors">利用規約</a>
                <a href="https://tarry-plywood-9b9.notion.site/287089f25fae80e8a771d66b1ee4fa82?source=copy_link" className="hover:text-[#FFD600] transition-colors">プライバシーポリシー</a>
                <Link href="/contact" className="hover:text-[#FFD600] transition-colors">お問い合わせ</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-end">
          <div className="max-w-[420px]">
            <p className="font-display text-[24px] font-bold uppercase tracking-widest text-white leading-none">
              <img src="/images/Vizion_Connection_logo-wt.png" alt="Logo" className="h-28 w-auto" />
            </p>
          </div>
          <Link
            href="/register"
            className="inline-block bg-[#FFD600] px-6 py-3 font-display text-[12px] font-black uppercase tracking-[0.15em] text-[#0B0B0F] transition-opacity hover:opacity-90"
            style={{ borderRadius: "2px" }}
          >
            今すぐ先行登録する
          </Link>
          <Link
            href="/business"
            className="inline-block mt-3 border border-[#3282FF] px-6 py-3 font-display text-[12px] font-black uppercase tracking-[0.15em] text-[#3282FF] transition-all hover:bg-[#3282FF] hover:text-white"
            style={{ borderRadius: "2px" }}
          >
            Business登録はこちら
          </Link>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8">
          <p className="font-body text-[10px] text-white/20 tracking-wider w-full text-center">
            © {new Date().getFullYear()} VIZION CONNECTION. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
