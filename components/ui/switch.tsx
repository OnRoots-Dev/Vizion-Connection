"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange, className, disabled, ...props }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked === true}
            disabled={disabled}
            onClick={() => {
                if (disabled) return;
                onCheckedChange(!checked);
            }}
            className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors",
                checked ? "bg-primary" : "bg-muted",
                disabled ? "opacity-50" : "opacity-100",
                className,
            )}
            {...props}
        >
            <span
                className={cn(
                    "inline-block h-5 w-5 translate-x-0 rounded-full bg-background shadow transition-transform",
                    checked ? "translate-x-5" : "translate-x-1",
                )}
            />
        </button>
    );
}
