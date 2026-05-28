"use client";

import { useEffect, useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ViewHeader, ViewLoader } from "@/app/(app)/dashboard/components/ui";
import type { BusinessPlanWithAvailability } from "@/features/business/types";
import BusinessCheckoutClient from "@/app/(app)/dashboard/business/checkout/BusinessCheckoutClient";

export function CheckoutView({
    t,
    roleColor,
    setView,
    initialPlanId = null,
}: {
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
    initialPlanId?: string | null;
}) {
    const [plans, setPlans] = useState<BusinessPlanWithAvailability[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/business-checkout", { cache: "no-store" })
            .then((res) => res.json())
            .then((data: { plans?: BusinessPlanWithAvailability[]; error?: string }) => {
                if (data.plans) {
                    setPlans(data.plans);
                } else {
                    setError(data.error ?? "プランの読み込みに失敗しました");
                }
            })
            .catch(() => setError("通信エラーが発生しました"));
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ViewHeader
                title="Businessプラン"
                sub="プランを選択して申し込む"
                onBack={() => setView("hub")}
                t={t}
                roleColor={roleColor}
            />

            {error ? (
                <div style={{ padding: "14px 16px", borderRadius: 14, border: "1px solid rgba(255,80,80,0.35)", background: "rgba(255,80,80,0.10)", color: "#ffb6b6", fontSize: 13 }}>
                    {error}
                </div>
            ) : !plans ? (
                <ViewLoader t={t} />
            ) : (
                <BusinessCheckoutClient plans={plans} initialPlanId={initialPlanId} />
            )}
        </div>
    );
}
