// features/moment/validation.ts
import { z } from "zod";

export const momentCreateSchema = z
    .object({
        body: z.string().trim().min(1, "内容は必須です").max(500, "500文字以内で入力してください"),
        image_url: z.string().url("URLが不正です").nullable().optional(),
        video_url: z.string().url("URLが不正です").nullable().optional(),
        visibility: z.enum(["public", "connections", "private"]),
        activity_id: z.string().uuid().nullable().optional(),
    })
    .strict();

export const momentCommentCreateSchema = z
    .object({
        body: z.string().trim().min(1, "コメントを入力してください").max(300, "300文字以内で入力してください"),
    })
    .strict();
