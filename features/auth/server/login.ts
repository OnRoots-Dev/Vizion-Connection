// features/auth/server/login.ts

import { findUserByEmail } from "@/lib/supabase/data/users.server";
import { verifyPassword } from "@/lib/auth/hash";
import { signSession } from "@/lib/auth/session";
import { loginSchema } from "@/features/auth/validation/login-schema";
import type { LoginInput } from "@/features/auth/types";
import { updateLastLogin } from "@/lib/supabase/data/users.server";

export type LoginResult =
    | { success: true; slug: string; role: string; token: string }
    | { success: false; error: string };

export async function loginUser(input: LoginInput): Promise<LoginResult> {
    // 1. バリデーション
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "入力内容が正しくありません";
        return { success: false, error: message };
    }

    const { email, password } = parsed.data;

    // 2. ユーザー検索
    const user = await findUserByEmail(email);
    if (!user) {
        // ユーザーが存在しないことを明かさないよう汎用メッセージ
        return {
            success: false,
            error: "メールアドレスまたはパスワードが正しくありません",
        };
    }

    // 3. メール未認証チェック
    if (!user.verified) {
        return {
            success: false,
            error:
                "メールアドレスが未確認です。受信したメールのリンクから確認を完了してください。",
        };
    }

    // 4. パスワード照合
    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
        return {
            success: false,
            error: "メールアドレスまたはパスワードが正しくありません",
        };
    }

    await updateLastLogin(user.slug);

    const token = signSession({
        userId: String(user.id),
        slug: user.slug,
        role: user.role,
        email: user.email,
    });

    return { success: true, slug: user.slug, role: user.role, token };
}