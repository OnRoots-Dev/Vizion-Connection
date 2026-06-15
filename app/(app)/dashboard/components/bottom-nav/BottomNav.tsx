"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { DashboardView, ThemeColors } from "../../types";
import { getPrimaryItems, getFanItems, type NavItem } from "./nav-config";
import { SubBtn } from "./SubBtn";
import { CenterPulseBtn } from "./CenterPulseBtn";
import { FanButtons } from "./FanButtons";
import { IdleHint } from "./IdleHint";

interface Props {
    role: string;
    /** SPA モード（DashboardClient 内）でのアクティブ判定用。 */
    view?: DashboardView;
    /**
     * SPA モードの遷移ハンドラ。渡された場合かつ /dashboard 上のときは
     * URL を変えずにビュー切替。未指定（グローバル AppShell）の場合は
     * /dashboard?view=… へ router 遷移する。
     */
    setView?: (v: DashboardView) => void;
    t: ThemeColors;
    theme: string;
    roleColor: string;
}

const IDLE_MS = 8000;

// モバイル向け Bottom Navigation。frosted glass バー + 中央 Pulse + Fan + IdleHint。
// 2 モード対応:
//   - SPA モード（setView あり / on /dashboard）= ビュー切替で URL を変えない
//   - グローバルモード（setView なし）= router でルート / /dashboard?view= へ遷移
export function BottomNav({ role, view, setView, t, theme, roleColor }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [expanded, setExpanded] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const hintConsumed = useRef(false);
    const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const primaryItems = useMemo(() => getPrimaryItems(role), [role]);
    const fanItems = useMemo(() => getFanItems(role), [role]);
    const onDashboard = pathname === "/dashboard";

    const isActive = useCallback(
        (item: NavItem) => {
            if (item.target.kind === "route") return pathname === item.target.href;
            // ビュー系のアクティブ判定は /dashboard 上の現在ビューのみ
            if (!onDashboard) return false;
            return view === item.target.view;
        },
        [pathname, view, onDashboard],
    );

    const go = useCallback(
        (item: NavItem) => {
            setExpanded(false);
            if (item.target.kind === "route") {
                router.push(item.target.href);
                return;
            }
            // ビュー遷移: dashboard 内なら SPA、外なら URL 深リンク
            if (setView && onDashboard) {
                setView(item.target.view);
            } else {
                router.push(`/dashboard?view=${item.target.view}`);
            }
        },
        [router, setView, onDashboard],
    );

    // アイドル検知: 一定時間操作がないと一度だけヒントを表示
    const armIdleTimer = useCallback(() => {
        if (hintConsumed.current) return;
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
            if (!hintConsumed.current) setShowHint(true);
        }, IDLE_MS);
    }, []);

    const consumeHint = useCallback(() => {
        hintConsumed.current = true;
        setShowHint(false);
        if (idleTimer.current) clearTimeout(idleTimer.current);
    }, []);

    useEffect(() => {
        armIdleTimer();
        const onInteract = () => {
            if (hintConsumed.current) return;
            setShowHint(false);
            armIdleTimer();
        };
        window.addEventListener("pointerdown", onInteract);
        window.addEventListener("scroll", onInteract, { passive: true });
        return () => {
            if (idleTimer.current) clearTimeout(idleTimer.current);
            window.removeEventListener("pointerdown", onInteract);
            window.removeEventListener("scroll", onInteract);
        };
    }, [armIdleTimer]);

    const onToggleCenter = useCallback(() => {
        consumeHint();
        setExpanded((v) => !v);
    }, [consumeHint]);

    const left = primaryItems.slice(0, 2);
    const right = primaryItems.slice(2, 4);
    const barBg = theme === "light" ? "rgba(245,245,247,0.78)" : "rgba(11,11,15,0.72)";

    return (
        <nav
            aria-label="メインナビゲーション"
            style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 30,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-around",
                height: 60,
                paddingBottom: "env(safe-area-inset-bottom)",
                background: barBg,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderTop: `1px solid ${t.border}`,
                boxShadow: "0 -4px 24px rgba(0,0,0,0.18)",
            }}
        >
            {/* Fan / IdleHint はバー中央基準で絶対配置 */}
            <FanButtons
                items={fanItems}
                open={expanded}
                onSelect={go}
                onClose={() => setExpanded(false)}
                t={t}
                roleColor={roleColor}
                theme={theme}
            />
            <IdleHint visible={showHint && !expanded} label="タップして Pulse を開く" t={t} roleColor={roleColor} theme={theme} />

            {left.map((item) => (
                <SubBtn key={item.id} item={item} active={isActive(item)} onSelect={go} t={t} roleColor={roleColor} />
            ))}

            <CenterPulseBtn expanded={expanded} onToggle={onToggleCenter} roleColor={roleColor} />

            {right.map((item) => (
                <SubBtn key={item.id} item={item} active={isActive(item)} onSelect={go} t={t} roleColor={roleColor} />
            ))}
        </nav>
    );
}
