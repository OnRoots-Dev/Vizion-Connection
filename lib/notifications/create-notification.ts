import { createNotification } from "@/lib/supabase/notifications";

export async function notifyCheerReceived(params: {
  toSlug: string;
  fromSlug: string | null;
  comment?: string;
}): Promise<void> {
  const fromLabel = params.fromSlug ? `@${params.fromSlug}` : "匿名ユーザー";
  const targetLabel = `@${params.toSlug}`;
  const commentPart = params.comment?.trim()
    ? ` コメント: 「${params.comment.trim().slice(0, 80)}」`
    : "";
  const body = `${fromLabel} が ${targetLabel} にCheerしました。${commentPart}`;

  await createNotification({
    recipientSlug: params.toSlug,
    actorSlug: params.fromSlug,
    type: "cheer_received",
    title: "Cheerが届きました",
    body,
    linkUrl: "/dashboard",
    payload: {
      fromSlug: params.fromSlug,
      hasComment: Boolean(params.comment?.trim()),
    },
  });
}

export async function notifyBusinessCheckoutSubmitted(params: {
  slug: string;
  planName: string;
  amount: number;
}): Promise<void> {
  await createNotification({
    recipientSlug: params.slug,
    type: "business_checkout_submitted",
    title: "ビジネスプラン申込を受け付けました",
    body: `${params.planName}（${params.amount.toLocaleString("ja-JP")}円）`,
    linkUrl: "/dashboard/business/checkout",
    payload: {
      planName: params.planName,
      amount: params.amount,
    },
  });
}

export async function notifyMissionRewardGranted(params: {
  slug: string;
  points: number;
}): Promise<void> {
  await createNotification({
    recipientSlug: params.slug,
    type: "mission_reward_granted",
    title: "ミッション達成報酬を付与しました",
    body: `+${params.points.toLocaleString("ja-JP")}pt`,
    linkUrl: "/dashboard",
    payload: {
      points: params.points,
    },
  });
}

export async function notifyActivityCreated(params: {
  slug: string;
  activityId: string;
  title: string;
}): Promise<void> {
  await createNotification({
    recipientSlug: params.slug,
    type: "activity_created",
    title: "Activityを作成しました",
    body: params.title || "新しいActivity",
    linkUrl: `/dashboard?view=activities&activityId=${params.activityId}`,
    payload: {
      activityId: params.activityId,
    },
  });
}

export async function notifyMomentCreated(params: {
  slug: string;
  momentId: string;
  activityTitle: string;
}): Promise<void> {
  await createNotification({
    recipientSlug: params.slug,
    type: "moment_created",
    title: "Momentを作成しました",
    body: `Activity: ${params.activityTitle}`,
    linkUrl: `/dashboard?view=moments&momentId=${params.momentId}`,
    payload: {
      momentId: params.momentId,
      activityId: params.activityTitle,
    },
  });
}
