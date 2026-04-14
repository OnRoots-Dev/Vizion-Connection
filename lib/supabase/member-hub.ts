import { countReferralsBySlug } from "@/lib/supabase/referrals";
import { supabaseServer } from "@/lib/supabase/server";
import type { ProfileRecord } from "@/lib/supabase/data/users.server";

export type MemberRewardCard = {
  id: string;
  title: string;
  description: string;
  accentColor: string;
  progress: number;
  requiredCount: number;
  unlocked: boolean;
  unlockedAt: string | null;
  conditionLabel: string;
};

export type MemberHubSummary = {
  activity: {
    items: Array<{
      id: string;
      type: "view" | "event" | "cheer";
      title: string;
      subtitle: string;
      createdAt: string;
    }>;
  };
  support: {
    totalCheersSent: number;
    users: Array<{
      slug: string;
      displayName: string;
      role: string;
      avatarUrl: string | null;
      cheerCount: number;
      lastCheeredAt: string;
    }>;
  };
  rewards: {
    earned: MemberRewardCard[];
    pending: MemberRewardCard[];
  };
  referral: {
    invitedCount: number;
    successCount: number;
    nextGoal: number;
    progressPercent: number;
  };
};

type RewardDefinition = {
  id: string;
  title: string;
  description: string;
  requirement_type: "cheers_sent" | "referrals_completed" | "events_joined";
  required_count: number;
  accent_color: string;
  sort_order: number;
};

function buildConditionLabel(type: RewardDefinition["requirement_type"], count: number) {
  if (type === "cheers_sent") return `Cheer ${count}回`;
  if (type === "events_joined") return `イベント参加 ${count}回`;
  return `紹介成功 ${count}人`;
}

function getProgressValue(type: RewardDefinition["requirement_type"], counts: Record<RewardDefinition["requirement_type"], number>) {
  return counts[type] ?? 0;
}

async function syncMemberRewardUnlocks(profile: ProfileRecord, definitions: RewardDefinition[], counts: Record<RewardDefinition["requirement_type"], number>) {
  const unlockable = definitions
    .filter((definition) => getProgressValue(definition.requirement_type, counts) >= definition.required_count)
    .map((definition) => ({ member_slug: profile.slug, reward_id: definition.id }));

  if (unlockable.length === 0) return;

  const { error } = await supabaseServer
    .from("member_reward_unlocks")
    .upsert(unlockable, { onConflict: "member_slug,reward_id", ignoreDuplicates: true });

  if (error) {
    console.error("[syncMemberRewardUnlocks]", error);
  }
}

export async function getMemberHubSummary(profile: ProfileRecord): Promise<MemberHubSummary> {
  const [viewRes, cheerRes, eventRes, rewardDefRes, rewardUnlockRes, referralSuccessCount] = await Promise.all([
    supabaseServer
      .from("discovery_events")
      .select("id, target_slug, created_at")
      .eq("viewer_slug", profile.slug)
      .eq("event_type", "detail_open")
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseServer
      .from("cheers")
      .select("id, to_slug, created_at")
      .eq("from_slug", profile.slug)
      .order("created_at", { ascending: false })
      .limit(30),
    supabaseServer
      .from("member_hub_events")
      .select("id, target_slug, event_type, label, created_at")
      .eq("member_slug", profile.slug)
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseServer
      .from("member_reward_definitions")
      .select("id, title, description, requirement_type, required_count, accent_color, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabaseServer
      .from("member_reward_unlocks")
      .select("reward_id, unlocked_at")
      .eq("member_slug", profile.slug),
    countReferralsBySlug(profile.slug),
  ]);

  if (viewRes.error) console.error("[getMemberHubSummary.views]", viewRes.error);
  if (cheerRes.error) console.error("[getMemberHubSummary.cheers]", cheerRes.error);
  if (eventRes.error) console.error("[getMemberHubSummary.events]", eventRes.error);
  if (rewardDefRes.error) console.error("[getMemberHubSummary.rewardDefs]", rewardDefRes.error);
  if (rewardUnlockRes.error) console.error("[getMemberHubSummary.rewardUnlocks]", rewardUnlockRes.error);

  const viewRows = viewRes.data ?? [];
  const cheerRows = cheerRes.data ?? [];
  const eventRows = eventRes.data ?? [];
  const rewardDefinitions = (rewardDefRes.data ?? []) as RewardDefinition[];
  const rewardUnlockMap = new Map((rewardUnlockRes.data ?? []).map((row) => [String(row.reward_id), String(row.unlocked_at)]));

  const targetSlugs = Array.from(new Set([
    ...viewRows.map((row) => String(row.target_slug ?? "")).filter(Boolean),
    ...cheerRows.map((row) => String(row.to_slug ?? "")).filter(Boolean),
    ...eventRows.map((row) => String(row.target_slug ?? "")).filter(Boolean),
  ]));

  const userMap = new Map<string, { displayName: string; role: string; avatarUrl: string | null }>();
  if (targetSlugs.length > 0) {
    const { data: users } = await supabaseServer
      .from("users")
      .select("slug, display_name, role, avatar_url")
      .in("slug", targetSlugs)
      .eq("is_deleted", false);

    for (const user of users ?? []) {
      userMap.set(String(user.slug), {
        displayName: String(user.display_name ?? user.slug),
        role: String(user.role ?? "Members"),
        avatarUrl: user.avatar_url ? String(user.avatar_url) : null,
      });
    }
  }

  const supportMap = new Map<string, MemberHubSummary["support"]["users"][number]>();
  for (const row of cheerRows) {
    const slug = String(row.to_slug ?? "");
    if (!slug) continue;
    const target = userMap.get(slug);
    const current = supportMap.get(slug);
    if (current) {
      current.cheerCount += 1;
      if (new Date(row.created_at).getTime() > new Date(current.lastCheeredAt).getTime()) {
        current.lastCheeredAt = String(row.created_at);
      }
      continue;
    }

    supportMap.set(slug, {
      slug,
      displayName: target?.displayName ?? slug,
      role: target?.role ?? "Unknown",
      avatarUrl: target?.avatarUrl ?? null,
      cheerCount: 1,
      lastCheeredAt: String(row.created_at),
    });
  }

  const invitedCount = eventRows.filter((row) => row.event_type === "referral_link_copied" || row.event_type === "referral_link_shared").length;
  const counts = {
    cheers_sent: cheerRows.length,
    referrals_completed: referralSuccessCount,
    events_joined: eventRows.filter((row) => row.event_type === "event_join").length,
  } satisfies Record<RewardDefinition["requirement_type"], number>;

  await syncMemberRewardUnlocks(profile, rewardDefinitions, counts);

  const rewardCards = rewardDefinitions.map((definition) => {
    const progress = getProgressValue(definition.requirement_type, counts);
    const unlockedAt = rewardUnlockMap.get(definition.id) ?? null;
    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      accentColor: definition.accent_color,
      progress,
      requiredCount: definition.required_count,
      unlocked: unlockedAt !== null || progress >= definition.required_count,
      unlockedAt,
      conditionLabel: buildConditionLabel(definition.requirement_type, definition.required_count),
    } satisfies MemberRewardCard;
  });

  const activityItems = [
    ...viewRows.map((row) => {
      const target = userMap.get(String(row.target_slug ?? ""));
      return {
        id: `view-${row.id}`,
        type: "view" as const,
        title: `${target?.displayName ?? row.target_slug ?? "プロフィール"} を閲覧`,
        subtitle: "Discovery からプロフィールを開きました",
        createdAt: String(row.created_at),
      };
    }),
    ...cheerRows.map((row) => {
      const target = userMap.get(String(row.to_slug ?? ""));
      return {
        id: `cheer-${row.id}`,
        type: "cheer" as const,
        title: `${target?.displayName ?? row.to_slug ?? "ユーザー"} に Cheer`,
        subtitle: "応援履歴として記録されています",
        createdAt: String(row.created_at),
      };
    }),
    ...eventRows.map((row) => {
      const target = userMap.get(String(row.target_slug ?? ""));
      const label = row.label ? String(row.label) : row.event_type === "event_join" ? "イベントに参加" : row.event_type === "referral_link_shared" ? "紹介リンクを共有" : "紹介リンクをコピー";
      return {
        id: `event-${row.id}`,
        type: "event" as const,
        title: target ? `${label} · ${target.displayName}` : label,
        subtitle: row.event_type === "event_join" ? "参加イベントとして記録されています" : "紹介トラッキングとして記録されています",
        createdAt: String(row.created_at),
      };
    }),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 18);

  const nextGoal = rewardCards
    .filter((card) => !card.unlocked)
    .map((card) => card.requiredCount)
    .sort((a, b) => a - b)[0] ?? Math.max(3, referralSuccessCount);

  return {
    activity: {
      items: activityItems,
    },
    support: {
      totalCheersSent: cheerRows.length,
      users: Array.from(supportMap.values()).sort((a, b) => {
        if (b.cheerCount !== a.cheerCount) return b.cheerCount - a.cheerCount;
        return new Date(b.lastCheeredAt).getTime() - new Date(a.lastCheeredAt).getTime();
      }),
    },
    rewards: {
      earned: rewardCards.filter((card) => card.unlocked),
      pending: rewardCards.filter((card) => !card.unlocked),
    },
    referral: {
      invitedCount,
      successCount: referralSuccessCount,
      nextGoal,
      progressPercent: Math.min((referralSuccessCount / Math.max(nextGoal, 1)) * 100, 100),
    },
  };
}

export async function recordMemberHubEvent(params: {
  memberSlug: string;
  eventType: "event_join" | "referral_link_copied" | "referral_link_shared";
  targetSlug?: string | null;
  label?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await supabaseServer.from("member_hub_events").insert({
    member_slug: params.memberSlug,
    target_slug: params.targetSlug ?? null,
    event_type: params.eventType,
    label: params.label ?? null,
    metadata: params.metadata ?? {},
  });

  if (error) {
    console.error("[recordMemberHubEvent]", error);
  }
}
