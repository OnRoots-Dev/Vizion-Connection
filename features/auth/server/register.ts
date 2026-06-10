// features/auth/server/register.ts
import { createClient } from "@/lib/supabase/server";
import { createUser, findUserByEmail, findUserBySlug, findUserByAmbassadorCode, countUsersByRole } from "@/lib/supabase/data/users.server";
import type { RegisterInput, RegisterResponse } from "@/features/auth/types";
import { rewardOnetimeMission } from "@/lib/onetime-missions";

const FOUNDING_MEMBER_LIMIT = 100;

function buildEmailRedirectTo(redirectTo?: string): string {
    const emailRedirectToBase = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/confirm`;
    return redirectTo
        ? `${emailRedirectToBase}?next=${encodeURIComponent(redirectTo)}`
        : emailRedirectToBase;
}

export async function resendSignupVerificationEmail(params: {
    email: string;
    redirectTo?: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
        type: "signup",
        email: params.email,
        options: {
            emailRedirectTo: buildEmailRedirectTo(params.redirectTo),
        },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function registerUser(input: RegisterInput): Promise<RegisterResponse> {
    const supabase = await createClient();
    const { email, password, role, displayName, slug, region, referrerSlug, redirectTo } = input;
    const resolvedDisplayName = displayName?.trim() || "";
    const resolvedRegion = region?.trim() || "未設定";

    // email + slug の重複チェックを並列実行
    const [existingByEmail, existingBySlug] = await Promise.all([
        findUserByEmail(email),
        findUserBySlug(slug),
    ]);

    if (existingByEmail) {
        if (!existingByEmail.verified) {
            const resendResult = await resendSignupVerificationEmail({ email, redirectTo });
            return {
                success: false,
                code: "PENDING_VERIFICATION",
                email,
                resent: resendResult.success,
                error: "このメールアドレスは既に仮登録されています",
            };
        }

        return {
            success: false,
            code: "ALREADY_REGISTERED",
            email,
            error: "このメールアドレスは既に登録済みです",
        };
    }

    if (existingBySlug) {
        return { success: false, error: "このユーザー名はすでに使用されています" };
    }

    if (referrerSlug && referrerSlug === slug) {
        return { success: false, error: "自分自身を紹介者に指定することはできません" };
    }

    // 紹介者ルックアップ + ロール数カウントを並列実行
    const [referrerUser, roleCount] = await Promise.all([
        referrerSlug
            ? findUserBySlug(referrerSlug).then((r) => r ?? findUserByAmbassadorCode(referrerSlug))
            : Promise.resolve(null),
        countUsersByRole(role),
    ]);

    if (referrerSlug && !referrerUser) {
        return { success: false, error: "紹介コードが無効です" };
    }
    const resolvedReferrerSlug = referrerUser?.slug;
    const isFoundingMember = roleCount < FOUNDING_MEMBER_LIMIT;

    const emailRedirectTo = buildEmailRedirectTo(redirectTo);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo,
            data: {
                slug,
                role,
            },
        },
    });

    if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
            const existingUser = await findUserByEmail(email);
            if (existingUser && !existingUser.verified) {
                const resendResult = await resendSignupVerificationEmail({ email, redirectTo });
                return {
                    success: false,
                    code: "PENDING_VERIFICATION",
                    email,
                    resent: resendResult.success,
                    error: "このメールアドレスは既に仮登録されています",
                };
            }

            return {
                success: false,
                code: "ALREADY_REGISTERED",
                email,
                error: "このメールアドレスは既に登録済みです",
            };
        }
        return { success: false, error: error.message };
    }

    if (!data.user) {
        return { success: false, error: "登録に失敗しました" };
    }

    const user = await createUser({
        authId: data.user.id,
        email,
        passwordHash: "supabase-auth",
        role,
        displayName: resolvedDisplayName,
        slug,
        region: resolvedRegion,
        referrerSlug: resolvedReferrerSlug,
        isFoundingMember,
    });
    if (!user) {
        return { success: false, error: "ユーザー作成に失敗しました" };
    }

    void rewardOnetimeMission(user.slug, "register_complete");

    return { success: true, slug: user.slug };
}
