import { supabaseServer as supabase } from "./server";

export type NotificationType =
  | "cheer_received"
  | "business_checkout_submitted"
  | "mission_reward_granted";

interface NotificationRow {
  id: number;
  recipient_slug: string;
  actor_slug: string | null;
  type: NotificationType;
  title: string;
  body: string;
  link_url: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  actorSlug: string | null;
  linkUrl: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  isRead: boolean;
}

export interface NotificationPageResult {
  items: NotificationItem[];
  page: number;
  limit: number;
  hasMore: boolean;
  unreadCount: number;
}

export async function createNotification(input: {
  recipientSlug: string;
  actorSlug?: string | null;
  type: NotificationType;
  title: string;
  body?: string;
  linkUrl?: string | null;
  payload?: Record<string, unknown>;
}): Promise<boolean> {
  const { error } = await supabase.from("notifications").insert({
    recipient_slug: input.recipientSlug,
    actor_slug: input.actorSlug ?? null,
    type: input.type,
    title: input.title,
    body: input.body ?? "",
    link_url: input.linkUrl ?? null,
    payload: input.payload ?? {},
  });

  if (error) {
    console.error("[createNotification]", error);
    return false;
  }
  return true;
}

export async function getUnreadNotificationCount(slug: string): Promise<number> {
  const { data, error } = await supabase.rpc("get_unread_notifications_count", {
    target_slug: slug,
  });
  if (error) {
    console.error("[getUnreadNotificationCount]", error);
    return 0;
  }
  return typeof data === "number" ? data : 0;
}

export async function getNotificationPage(params: {
  slug: string;
  page: number;
  limit: number;
}): Promise<NotificationPageResult> {
  const page = Math.max(1, params.page);
  const limit = Math.min(50, Math.max(1, params.limit));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const [{ data, error }, { count }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, recipient_slug, actor_slug, type, title, body, link_url, payload, created_at")
      .eq("recipient_slug", params.slug)
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_slug", params.slug),
  ]);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as NotificationRow[];
  const ids = rows.map((r) => r.id);

  let readIdSet = new Set<number>();
  if (ids.length > 0) {
    const { data: readRows, error: readError } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("reader_slug", params.slug)
      .in("notification_id", ids);
    if (readError) {
      throw readError;
    }
    readIdSet = new Set((readRows ?? []).map((r) => Number(r.notification_id)));
  }

  const unreadCount = await getUnreadNotificationCount(params.slug);
  const totalCount = count ?? 0;
  const hasMore = page * limit < totalCount;

  const items: NotificationItem[] = rows.map((r) => ({
    id: Number(r.id),
    type: r.type,
    title: r.title,
    body: r.body,
    actorSlug: r.actor_slug,
    linkUrl: r.link_url,
    payload: r.payload ?? {},
    createdAt: r.created_at,
    isRead: readIdSet.has(Number(r.id)),
  }));

  return { items, page, limit, hasMore, unreadCount };
}

export async function markNotificationsRead(slug: string, notificationIds: number[]): Promise<number> {
  const ids = Array.from(new Set(notificationIds.map((id) => Number(id)).filter((id) => Number.isFinite(id))));
  if (ids.length === 0) return 0;

  const { data, error } = await supabase.rpc("mark_notifications_read", {
    target_slug: slug,
    target_ids: ids,
  });
  if (error) {
    console.error("[markNotificationsRead]", error);
    throw error;
  }
  return typeof data === "number" ? data : 0;
}

export async function markAllNotificationsRead(slug: string): Promise<number> {
  const { data, error } = await supabase.rpc("mark_all_notifications_read", {
    target_slug: slug,
  });
  if (error) {
    console.error("[markAllNotificationsRead]", error);
    throw error;
  }
  return typeof data === "number" ? data : 0;
}
