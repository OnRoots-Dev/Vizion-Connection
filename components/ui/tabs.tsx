"use client";

// components/ui/tabs.tsx — segmented tabs（Design System v2）
// roving tabindex + 矢印キー対応。active は accent（選択状態の規約に従う）。

import { useRef } from "react";

export interface TabItem<T extends string> {
    value: T;
    label: string;
    badge?: number;
}

export interface TabsProps<T extends string> {
    value: T;
    onChange: (value: T) => void;
    items: ReadonlyArray<TabItem<T>>;
    ariaLabel: string;
}

export function Tabs<T extends string>({ value, onChange, items, ariaLabel }: TabsProps<T>) {
    const listRef = useRef<HTMLDivElement>(null);

    function handleKeyDown(event: React.KeyboardEvent) {
        const index = items.findIndex((item) => item.value === value);
        let next = -1;
        if (event.key === "ArrowRight") next = (index + 1) % items.length;
        if (event.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = items.length - 1;
        if (next >= 0) {
            event.preventDefault();
            onChange(items[next].value);
            const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]");
            buttons?.[next]?.focus();
        }
    }

    return (
        <div
            ref={listRef}
            role="tablist"
            aria-label={ariaLabel}
            onKeyDown={handleKeyDown}
            style={{
                display: "inline-flex",
                gap: 2,
                padding: 3,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--vc-border)",
            }}
        >
            {items.map((item) => {
                const active = item.value === value;
                return (
                    <button
                        key={item.value}
                        role="tab"
                        type="button"
                        aria-selected={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() => onChange(item.value)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            minHeight: 34,
                            padding: "6px 14px",
                            borderRadius: 9,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: active ? 800 : 600,
                            color: active ? "var(--on-accent)" : "var(--vc-text-secondary)",
                            background: active ? "var(--vc-accent)" : "transparent",
                            transition: "background-color var(--vc-dur-fast) var(--vc-ease-out), color var(--vc-dur-fast) var(--vc-ease-out)",
                        }}
                        onFocus={(e) => { e.currentTarget.style.boxShadow = "var(--vc-focus-ring)"; }}
                        onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                    >
                        {item.label}
                        {typeof item.badge === "number" && item.badge > 0 ? (
                            <span
                                style={{
                                    display: "grid",
                                    placeItems: "center",
                                    minWidth: 16,
                                    height: 16,
                                    padding: "0 4px",
                                    borderRadius: 999,
                                    fontSize: 9,
                                    fontWeight: 900,
                                    background: active ? "rgba(0,0,0,0.22)" : "var(--vc-accent)",
                                    color: active ? "var(--on-accent)" : "#000",
                                }}
                            >
                                {item.badge > 99 ? "99+" : item.badge}
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}
