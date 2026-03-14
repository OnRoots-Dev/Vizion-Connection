// features/auth/server/register.ts

import { hashPassword } from "@/lib/auth/hash";
import { createUser, findUserByEmail, findUserBySlug, findUserByAmbassadorCode, getNextSerialId, updateUserSerialId } from "@/lib/airtable/users";
import { sendVerifyEmail } from "@/lib/resend/send-verify-email";
import { issueVerifyToken } from "@/features/auth/server/tokens";
import { registerSchema } from "@/features/auth/validation/register-schema";
import type { RegisterInput, RegisterResponse } from "@/features/auth/types";

export async function registerUser(input: RegisterInput): Promise<RegisterResponse> {
    // 1. バリデーション
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "入力内容が正しくありません";
        return { success: false, error: message };
    }

    const { email, password, role, displayName, slug, referrerSlug } = parsed.data;

    // 2. メール重複チェック
    const existingByEmail = await findUserByEmail(email);
    if (existingByEmail) {
        return { success: false, error: "このメールアドレスはすでに登録されています" };
    }

    // 3. スラッグ重複チェック
    const existingBySlug = await findUserBySlug(slug);
    if (existingBySlug) {
        return { success: false, error: "このユーザー名はすでに使用されています" };
    }

    // 3-a. 自己紹介チェック
    if (referrerSlug && referrerSlug === slug) {
        return { success: false, error: "自分自身を紹介者に指定することはできません" };
    }

    // 3-b. 紹介者の存在チェック
    let resolvedReferrerSlug: string | undefined = undefined;
    if (referrerSlug) {
        let referrer = await findUserBySlug(referrerSlug);
        if (!referrer) {
            referrer = await findUserByAmbassadorCode(referrerSlug);
        }
        if (!referrer) {
            return { success: false, error: "紹介コードが無効です" };
        }
        resolvedReferrerSlug = referrer.slug;
    }

    // 4. パスワードハッシュ化
    const passwordHash = await hashPassword(input.password);

    // 5. rand生成を追加
    const rand = (d: number) =>
        Math.floor(Math.random() * 10 ** d).toString().padStart(d, "0");
    const randA = rand(5);
    const randB = rand(5);

    // 6. ユーザー作成
    const user = await createUser({
        email,
        passwordHash,
        role,
        displayName,
        slug,
        referrerSlug: resolvedReferrerSlug,
        randA,
        randB,
    });

    // 7. memberId を組み立てて serialId として保存
    const seq = user.seq ?? 1;
    const memberId = `VZ-${randA}-${randB}-${seq.toString().padStart(5, "0")}`;
    await updateUserSerialId(user.id, memberId);

    // 8. 認証トークン発行
    const { verifyUrl } = await issueVerifyToken(email, slug);

    // 9. 認証メール送信
    await sendVerifyEmail({
        to: email,
        displayName: user.displayName,
        verifyUrl,
    });

    return { success: true, slug: user.slug };
}