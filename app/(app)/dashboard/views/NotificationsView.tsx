"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { SectionCard, SLabel, ViewHeader, ViewLoader } from "@/app/(app)/dashboard/components/ui";
import AdCard from "@/app/(app)/news-rooms/components/AdCard";

type InlineAd = {
  id: string;
  headline: string;
  image_url?: string;
  link_url: string;
  sponsor?: string;
  business_id?: number;
};

interface NotificationItem {
  id: number;
  type: "cheer_received" | "business_checkout_submitted" | "mission_reward_granted";
  title: string;
  body: string;
  actorSlug: string | null;
  linkUrl: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  isRead: boolean;
}

interface NotificationsResponse {
  success: boolean;
  error?: string;
  items?: NotificationItem[];
  page?: number;
  limit?: number;
  hasMore?: boolean;
  unreadCount?: number;
}

interface MarkReadResponse {
  success: boolean;
  error?: string;
  markedCount?: number;
  unreadCount?: number;
}

type FirstPageCache = {
  items: NotificationItem[];
  page: number;
  hasMore: boolean;
  unreadCount: number;
};

let firstPageCache: FirstPageCache | null = null;
let firstPageInFlight: Promise<FirstPageCache> | null = null;

const TYPE_LABEL: Record<NotificationItem["type"], string> = {
  cheer_received: "Cheer",
  business_checkout_submitted: "Business",
  mission_reward_granted: "Missions",
};

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsView({
  t,
  roleColor,
  setView,
  onUnreadCountChange,
}: {
  t: ThemeColors;
  roleColor: string;
  setView: (v: DashboardView) => void;
  onUnreadCountChange: (count: number) => void;
}) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const [ads, setAds] = useState<InlineAd[]>([]);

  useEffect(() => {
    fetch("/api/ads", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setAds(Array.isArray(data?.ads) ? data.ads : []))
      .catch(() => setAds([]));
  }, []);

  const unreadInList = useMemo(() => items.filter((i) => !i.isRead).length, [items]);

  const fetchFirstPage = useCallback(async (): Promise<FirstPageCache> => {
    if (firstPageCache) return firstPageCache;
    if (firstPageInFlight) return firstPageInFlight;

    firstPageInFlight = (async () => {
      const res = await fetch("/api/notifications?page=1&limit=15");
      const data = (await res.json()) as NotificationsResponse;
      if (!data.success || !data.items) {
        throw new Error(data.error ?? "通知の取得に失敗しました");
      }
      const cached: FirstPageCache = {
        items: data.items,
        page: data.page ?? 1,
        hasMore: Boolean(data.hasMore),
        unreadCount: data.unreadCount ?? 0,
      };
      firstPageCache = cached;
      return cached;
    })();

    try {
      return await firstPageInFlight;
    } finally {
      firstPageInFlight = null;
    }
  }, []);

  const loadPage = useCallback(async (nextPage: number, append: boolean) => {
    const query = new URLSearchParams({
      page: String(nextPage),
      limit: "15",
    });
    const res = await fetch(`/api/notifications?${query.toString()}`);
    const data = (await res.json()) as NotificationsResponse;
    if (!data.success || !data.items) {
      throw new Error(data.error ?? "通知の取得に失敗しました");
    }

    setItems((prev) => (append ? [...prev, ...data.items!] : data.items!));
    setPage(data.page ?? nextPage);
    setHasMore(Boolean(data.hasMore));
    onUnreadCountChange(data.unreadCount ?? 0);
  }, [onUnreadCountChange]);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const first = await fetchFirstPage();
      setItems(first.items);
      setPage(first.page);
      setHasMore(first.hasMore);
      onUnreadCountChange(first.unreadCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通知の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [fetchFirstPage, onUnreadCountChange]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  const markOneRead = useCallback(async (id: number) => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: [id] }),
      });
      const data = (await res.json()) as MarkReadResponse;
      if (!data.success) throw new Error(data.error ?? "既読処理に失敗しました");

      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
      firstPageCache = null;
      onUnreadCountChange(data.unreadCount ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "既読処理に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }, [onUnreadCountChange]);

  const markAllRead = useCallback(async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      const data = (await res.json()) as MarkReadResponse;
      if (!data.success) throw new Error(data.error ?? "既読処理に失敗しました");

      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
      firstPageCache = null;
      onUnreadCountChange(data.unreadCount ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "既読処理に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }, [onUnreadCountChange]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      await loadPage(page + 1, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通知の取得に失敗しました");
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, loadPage, page]);

  if (loading) {
    return (
      <>
        <ViewHeader title="Notifications" sub="通知一覧" onBack={() => setView("home")} t={t} roleColor={roleColor} />
        <ViewLoader t={t} />
      </>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ViewHeader title="Notifications" sub="通知一覧" onBack={() => setView("home")} t={t} roleColor={roleColor} />

      <SectionCard t={t}>
        <SLabel text="Overview" color={roleColor} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: t.sub }}>
            未読 {unreadInList} 件
          </p>
          <button
            onClick={markAllRead}
            disabled={submitting || unreadInList === 0}
            style={{
              border: `1px solid ${roleColor}44`,
              background: "transparent",
              color: unreadInList === 0 ? t.sub : roleColor,
              opacity: unreadInList === 0 ? 0.5 : 1,
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 700,
              cursor: unreadInList === 0 ? "not-allowed" : "pointer",
            }}
          >
            すべて既読にする
          </button>
        </div>
        {error && (
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#ff6b6b" }}>
            {error}
          </p>
        )}
      </SectionCard>

      {ads.length > 0 ? (
        <AdCard ad={ads[0]!} />
      ) : (
        <SectionCard t={t}>
          <SLabel text="AD SLOT" color="#FFD600" />
          <p style={{ margin: 0, fontSize: 11, color: t.sub, opacity: 0.5 }}>全国スポンサー広告枠（空き枠）</p>
        </SectionCard>
      )}

      {items.length === 0 ? (
        <SectionCard t={t}>
          <p style={{ margin: 0, fontSize: 12, color: t.sub }}>通知はまだありません。</p>
        </SectionCard>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {items.map((item) => (
            <SectionCard key={item.id} t={t} accentColor={item.isRead ? undefined : roleColor}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 9,
                      fontFamily: "monospace",
                      letterSpacing: "0.08em",
                      color: item.isRead ? t.sub : roleColor,
                    }}>
                      {TYPE_LABEL[item.type]}
                    </span>
                    {!item.isRead && (
                      <span style={{
                        fontSize: 9,
                        fontWeight: 900,
                        color: roleColor,
                        border: `1px solid ${roleColor}55`,
                        borderRadius: 999,
                        padding: "1px 6px",
                      }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "6px 0 4px", fontSize: 14, fontWeight: 700, color: t.text }}>{item.title}</p>
                  {item.body && (
                    <p style={{ margin: 0, fontSize: 12, color: t.sub, lineHeight: 1.65 }}>{item.body}</p>
                  )}
                  <p style={{ margin: "6px 0 0", fontSize: 10, color: t.sub }}>
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {item.linkUrl && (
                    <a
                      href={item.linkUrl}
                      style={{ fontSize: 11, color: roleColor, textDecoration: "none", whiteSpace: "nowrap" }}
                    >
                      開く
                    </a>
                  )}
                  {!item.isRead && (
                    <button
                      onClick={() => markOneRead(item.id)}
                      disabled={submitting}
                      style={{
                        border: `1px solid ${t.border}`,
                        background: "transparent",
                        color: t.sub,
                        borderRadius: 7,
                        padding: "5px 8px",
                        fontSize: 10,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      既読
                    </button>
                  )}
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          style={{
            border: `1px solid ${t.border}`,
            background: "transparent",
            color: t.text,
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 12,
            fontWeight: 700,
            cursor: loadingMore ? "wait" : "pointer",
          }}
        >
          {loadingMore ? "読み込み中..." : "さらに読み込む"}
        </button>
      )}
    </div>
  );
}
