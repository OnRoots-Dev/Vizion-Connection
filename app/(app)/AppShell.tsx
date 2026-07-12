"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "./dashboard/components/bottom-nav/BottomNav";
import { useVzTheme } from "./dashboard/components/bottom-nav/useVzTheme";
import { ROLE_COLOR } from "./dashboard/types";

// 認証エリア（app/(app)/*）共通シェル。children の下に BottomNav をぶら下げる。
//
//   AppShell
//    ├ children
//    └ BottomNav（グローバルモード）
//
// /dashboard は DashboardClient が自前の SPA 連動 BottomNav を描画するため、
// 二重表示と SPA 挙動の破壊を避けて AppShell 側のグローバル nav は抑制する。
export function AppShell({ role, children }: { role: string | null; children: React.ReactNode }) {
    const pathname = usePathname();
    const { theme, t } = useVzTheme();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // /dashboard は自前 nav・未ログイン(role=null)・デスクトップでは出さない
    const showNav = Boolean(role) && isMobile && pathname !== "/dashboard";
    const roleColor = role ? ROLE_COLOR[role as keyof typeof ROLE_COLOR] ?? "#a78bfa" : "#a78bfa";

    return (
        <>
            {children}
            {showNav && (
                <>
                    {/* 固定バーに最終コンテンツが隠れないようスペーサーを差し込む */}
                    <div aria-hidden style={{ height: "calc(60px + env(safe-area-inset-bottom))" }} />
                    <BottomNav role={role as string} t={t} theme={theme} roleColor={roleColor} />
                </>
            )}
        </>
    );
}
