// features/auth/validation/login-schema.ts

import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "メールアドレスを入力してください")
        .email("有効なメールアドレスを入力してください"),
    password: z
        .string()
        .min(1, "パスワードを入力してください")
        .max(100, "パスワードが長すぎます"),
});

export type LoginSchema = z.infer<typeof loginSchema>;