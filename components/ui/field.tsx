"use client";

// components/ui/field.tsx — form field（Design System v2）
// label + control + hint/error のバンドル。control は Input / Textarea / Select を使う。

import { useState } from "react";

export const controlStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 1.5,
    color: "var(--vc-text-primary)",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid var(--vc-border)",
    outline: "none",
    boxSizing: "border-box",
    caretColor: "var(--vc-accent)",
    transition: "border-color var(--vc-dur-fast) var(--vc-ease-out)",
};

const BORDER = "1px solid var(--vc-border)";

/** focus/invalid 状態をtokenで扱うInput。`invalid`はZodエラー等に使用。 */
export function Input({ invalid, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
    const [focused, setFocused] = useState(false);
    return (
        <input
            {...props}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            style={{
                ...controlStyle,
                borderColor: invalid ? "var(--vc-danger)" : focused ? "var(--vc-border-active)" : BORDER,
                boxShadow: focused ? "var(--vc-focus-ring)" : "none",
            }}
        />
    );
}

export function Textarea({ invalid, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
    const [focused, setFocused] = useState(false);
    return (
        <textarea
            {...props}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            style={{
                ...controlStyle,
                resize: "vertical",
                minHeight: 88,
                borderColor: invalid ? "var(--vc-danger)" : focused ? "var(--vc-border-active)" : BORDER,
                boxShadow: focused ? "var(--vc-focus-ring)" : "none",
            }}
        />
    );
}

export function Select({ invalid, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
    const [focused, setFocused] = useState(false);
    return (
        <select
            {...props}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            style={{
                ...controlStyle,
                appearance: "none",
                cursor: "pointer",
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                paddingRight: 36,
                borderColor: invalid ? "var(--vc-danger)" : focused ? "var(--vc-border-active)" : BORDER,
                boxShadow: focused ? "var(--vc-focus-ring)" : "none",
            }}
        >
            {children}
        </select>
    );
}

export function Field({
    label,
    required,
    hint,
    error,
    htmlFor,
    children,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    htmlFor?: string;
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
                htmlFor={htmlFor}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
                    color: error ? "var(--vc-danger)" : "var(--vc-text-muted)",
                }}
            >
                {label}
                {required ? <span style={{ color: "var(--vc-danger)" }}>*</span> : null}
            </label>
            {children}
            {error ? (
                <p role="alert" style={{ margin: 0, fontSize: 12, color: "var(--vc-danger)" }}>{error}</p>
            ) : hint ? (
                <p style={{ margin: 0, fontSize: 12, color: "var(--vc-text-muted)" }}>{hint}</p>
            ) : null}
        </div>
    );
}
