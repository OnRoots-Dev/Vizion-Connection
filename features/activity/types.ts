// features/activity/types.ts
// activities テーブル 1 行に対応する正規 Activity 契約（P0 DB Contract）。

export const ACTIVITY_VISIBILITIES = ["public", "connections", "private"] as const;
export type ActivityVisibility = (typeof ACTIVITY_VISIBILITIES)[number];

export const ACTIVITY_STATUSES = ["planned", "completed", "cancelled"] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const ACTIVITY_TYPES = [
    "practice",
    "training",
    "match",
    "competition",
    "event",
    "coaching",
    "session",
    "workshop",
    "watching",
    "supporting",
    "participation",
    "other",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

import type { UserRole } from "@/features/auth/types";

// Role ごとにアプリケーション層で許可される Activity Type。
// DB の CHECK 制約は全型を受け、このマトリクスは zod/サービス層で強制する。
export const ACTIVITY_TYPES_BY_ROLE: Record<UserRole, readonly ActivityType[]> = {
    Athlete: ["practice", "training", "match", "competition", "event", "other"],
    Trainer: ["coaching", "session", "workshop", "training", "event", "other"],
    Crew: ["watching", "supporting", "participation", "event", "other"],
    Business: ["event", "supporting", "other"],
    Admin: [...ACTIVITY_TYPES],
};

export interface PlaceRef {
    id: string;
    name: string;
    prefecture: string;
    latitude: number;
    longitude: number;
    precision: "exact" | "approximate";
    place_type: string;
}

export interface ActivityRecord {
    id: string;
    user_id: number;
    type: ActivityType;
    title: string | null;
    description: string | null;
    starts_at: string;
    ends_at: string | null;
    place_id: string | null;
    visibility: ActivityVisibility;
    tags: string[];
    status: ActivityStatus;
    image_url: string | null;
    video_url: string | null;
    cheer_count: number;
    comment_count: number;
    created_at: string;
    updated_at: string;
}

/** Activity への文脈付きコメント（1行）。moment_comments と同型。 */
export interface ActivityCommentRecord {
    id: string;
    activity_id: string;
    user_id: number;
    body: string;
    created_at: string;
}

/** Together Activity 参加状態（pending -> accepted / declined）。Connection とは独立。 */
export const ACTIVITY_PARTICIPANT_STATUSES = ["pending", "accepted", "declined"] as const;
export type ActivityParticipantStatus = (typeof ACTIVITY_PARTICIPANT_STATUSES)[number];

export interface ActivityParticipantRecord {
    id: string;
    activity_id: string;
    user_id: number;
    status: ActivityParticipantStatus;
    role: string | null;
    invited_by: number;
    created_at: string;
    updated_at: string;
}

export interface CreateActivityInput {
    type: ActivityType;
    title?: string | null;
    description?: string | null;
    starts_at: string;
    ends_at?: string | null;
    place_id?: string | null;
    visibility: ActivityVisibility;
    tags?: string[];
    status?: ActivityStatus;
    image_url?: string | null;
    video_url?: string | null;
}

export type UpdateActivityInput = Partial<CreateActivityInput>;
