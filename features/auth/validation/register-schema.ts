// features/auth/validation/register-schema.ts

import { z } from "zod";

export const VALID_ROLES = ["Athlete", "Trainer", "Members", "Business"] as const;

export const registerSchema = z.object({
    email: z
        .string()
        .min(1, "メールアドレスを入力してください")
        .email("有効なメールアドレスを入力してください"),
    password: z
        .string()
        .min(8, "パスワードは8文字以上で入力してください")
        .max(100, "パスワードが長すぎます")
        .regex(
            /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/,
            "パスワードは英数字・記号のみ使用できます（スペース不可）"
        ),
    role: z.enum(VALID_ROLES, {
        message: "ロールを選択してください",
    }),
    displayName: z
        .string()
        .min(1, "表示名を入力してください")
        .max(50, "表示名は50文字以内で入力してください"),
    slug: z
        .string()
        .min(3, "スラッグは3文字以上で入力してください")
        .max(30, "スラッグは30文字以内で入力してください")
        .regex(
            /^[a-z0-9_-]+$/,
            "スラッグは英小文字・数字・ハイフン・アンダースコアのみ使用できます"
        ),
    referrerSlug: z.string().optional().transform(v => v === "" ? undefined : v),
});

export type RegisterSchema = z.infer<typeof registerSchema>;