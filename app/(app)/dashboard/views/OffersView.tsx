"use client";

import { useEffect, useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ViewHeader, SectionCard, SLabel } from "@/app/(app)/dashboard/components/ui";

type ReceivedOffer = {
  id: string;
  title: string;
  message: string;
  rewardAmount: number;
  status: "sent" | "approved" | "rejected";
  business: {
    slug: string;
    displayName: string;
  };
  createdAt: string;
  updatedAt: string;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OffersView({
  t,
  roleColor,
  setView,
}: {
  t: ThemeColors;
  roleColor: string;
  setView: (v: DashboardView) => void;
}) {
  const [offers, setOffers] = useState<ReceivedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/offers/received", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.success === false) {
          throw new Error(typeof json?.error === "string" ? json.error : "オファー一覧の取得に失敗しました");
        }
        if (active) setOffers(Array.isArray(json.offers) ? json.offers : []);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "オファー一覧の取得に失敗しました");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  async function updateStatus(offerId: string, status: ReceivedOffer["status"]) {
    setSavingId(offerId);
    setError(null);
    try {
      const res = await fetch(`/api/offers/received/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.success === false) {
        throw new Error(typeof json?.error === "string" ? json.error : "オファー更新に失敗しました");
      }
      setOffers((current) => current.map((offer) => (offer.id === offerId ? (json.offer as ReceivedOffer) : offer)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "オファー更新に失敗しました");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ViewHeader title="Offers" sub="届いた案件を確認・管理" onBack={() => setView("hub")} t={t} roleColor={roleColor} />

      <SectionCard t={t} accentColor={roleColor}>
        <SLabel text="Incoming Offers" color={roleColor} />
        {loading ? (
          <p className="m-0 text-sm" style={{ color: t.sub }}>読み込み中...</p>
        ) : error ? (
          <p className="m-0 text-sm text-[#ff9b9b]">{error}</p>
        ) : offers.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-4 py-5 text-sm" style={{ borderColor: t.border, color: t.sub }}>
            現在受信しているオファーはありません。
          </div>
        ) : (
          <div className="grid gap-3">
            {offers.map((offer) => {
              const activeStatus = offer.status;
              return (
                <div key={offer.id} className="rounded-[18px] border p-4" style={{ borderColor: t.border, background: "rgba(255,255,255,0.025)" }}>
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-[17px] font-black" style={{ color: t.text }}>{offer.title}</p>
                      <p className="mt-1 mb-0 text-[11px]" style={{ color: t.sub }}>
                        送信元: {offer.business.displayName} @{offer.business.slug}
                      </p>
                    </div>
                    <span
                      className="rounded-full border px-[10px] py-[5px] text-[10px] font-extrabold"
                      style={{
                        borderColor: activeStatus === "approved" ? "#32D27855" : activeStatus === "rejected" ? "#ff757555" : `${roleColor}45`,
                        background: activeStatus === "approved" ? "rgba(50,210,120,0.12)" : activeStatus === "rejected" ? "rgba(255,80,80,0.12)" : `${roleColor}12`,
                        color: activeStatus === "approved" ? "#7ff0a7" : activeStatus === "rejected" ? "#ffb3b3" : roleColor,
                      }}
                    >
                      {activeStatus === "sent" ? "確認待ち" : activeStatus === "approved" ? "承認" : "辞退"}
                    </span>
                  </div>

                  <p className="mt-0 mb-4 text-sm leading-7" style={{ color: t.sub }}>{offer.message}</p>

                  <div className="mb-4 grid gap-2 md:grid-cols-3">
                    <div className="rounded-2xl border p-3" style={{ borderColor: t.border, background: "rgba(255,255,255,0.03)" }}>
                      <div className="text-[10px]" style={{ color: t.sub }}>報酬</div>
                      <div className="mt-1 text-base font-black" style={{ color: t.text }}>{formatYen(offer.rewardAmount)}</div>
                    </div>
                    <div className="rounded-2xl border p-3" style={{ borderColor: t.border, background: "rgba(255,255,255,0.03)" }}>
                      <div className="text-[10px]" style={{ color: t.sub }}>受信日時</div>
                      <div className="mt-1 text-xs font-bold" style={{ color: t.text }}>{formatDateTime(offer.createdAt)}</div>
                    </div>
                    <div className="rounded-2xl border p-3" style={{ borderColor: t.border, background: "rgba(255,255,255,0.03)" }}>
                      <div className="text-[10px]" style={{ color: t.sub }}>最終更新</div>
                      <div className="mt-1 text-xs font-bold" style={{ color: t.text }}>{formatDateTime(offer.updatedAt)}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["sent", "approved", "rejected"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={savingId === offer.id}
                        onClick={() => void updateStatus(offer.id, status)}
                        className="rounded-[10px] border px-3 py-2 text-[11px] font-bold"
                        style={{
                          borderColor: activeStatus === status ? `${roleColor}45` : t.border,
                          background: activeStatus === status ? `${roleColor}14` : "rgba(255,255,255,0.03)",
                          color: activeStatus === status ? roleColor : t.sub,
                          cursor: savingId === offer.id ? "progress" : "pointer",
                          opacity: savingId === offer.id ? 0.7 : 1,
                        }}
                      >
                        {status === "sent" ? "保留に戻す" : status === "approved" ? "承認する" : "辞退する"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
