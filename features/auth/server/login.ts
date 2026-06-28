// features/auth/server/login.ts
import { createClient } from "@/lib/supabase/server";
import type { LoginInput } from "@/features/auth/types";
import { findUserBySlug, updateLastLogin } from "@/lib/supabase/data/users.server";

export type LoginResult =
    | { success: true; slug: string; role: string; isOnboardingComplete: boolean }
    | { success: false; code: 'email_not_confirmed'; message: string }
    | { success: false; code: 'invalid_credentials'; message: string }
    | { success: false; error: string };

export async function loginUser(input: LoginInput): Promise<LoginResult> {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
    });

    if (error) {
        if (
            error.message?.includes('Email not confirmed') ||
            error.message?.includes('email_not_confirmed')
        ) {
            return {
                success: false,
                code: 'email_not_confirmed',
                message: 'メールアドレスの確認が完了していません。届いているメールのリンクをクリックしてください。',
            };
        }
        return {
            success: false,
            code: 'invalid_credentials',
            message: 'メールアドレスまたはパスワードが正しくありません。',
        };
    }
    if (!data.user) {
        return {
            success: false,
            code: 'invalid_credentials',
            message: 'メールアドレスまたはパスワードが正しくありません。',
        };
    }

    const slug = data.user.user_metadata.slug as string | undefined;
    const role = data.user.user_metadata.role as string | undefined;
    if (!slug || !role) {
        return { success: false, error: "ログインユーザー情報の取得に失敗しました" };
    }

    const profile = await findUserBySlug(slug);
    if (!profile) {
        return { success: false, error: "プロフィールが見つかりません" };
    }

    void updateLastLogin(profile.slug);

    return {
        success: true,
        slug: profile.slug,
        role: role,
        isOnboardingComplete: profile.isOnboardingComplete ?? false,
    };
}
