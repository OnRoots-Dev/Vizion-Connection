// features/activity/validation.ts
import { z } from "zod";
import {
    ACTIVITY_STATUSES,
    ACTIVITY_TYPES,
    ACTIVITY_TYPES_BY_ROLE,
} from "./types";
import type { ActivityType } from "./types";
import type { UserRole } from "@/features/auth/types";

export const activityCreateSchema = z
    .object({
        type: z.enum(ACTIVITY_TYPES),
        title: z.string().trim().min(1, "タイトルを入力してください").max(60, "60文字以内で入力してください").nullable().optional(),
        description: z.string().trim().max(500, "500文字以内で入力してください").nullable().optional(),
        starts_at: z.string().datetime({ offset: true, message: "開始日時が不正です" }),
        ends_at: z.string().datetime({ offset: true, message: "終了日時が不正です" }).nullable().optional(),
        place_id: z.string().uuid("場所の指定が不正です").nullable().optional(),
        visibility: z.enum(["public", "connections", "private"]),
        tags: z.array(z.string().trim().min(1).max(20)).max(5, "タグは5つまでです").optional(),
        status: z.enum(ACTIVITY_STATUSES).optional(),
        image_url: z.string().url("画像URLが不正です").nullable().optional(),
        video_url: z.string().url("動画URLが不正です").nullable().optional(),
    })
    .strict();

export const activityUpdateSchema = activityCreateSchema.partial().strict();

// Role × Activity Type マトリクス（仕様 §11）。DB ではなくアプリ層で強制する。
export function assertActivityTypeAllowed(role: UserRole, type: ActivityType): boolean {
    return ACTIVITY_TYPES_BY_ROLE[role]?.includes(type) ?? false;
}
