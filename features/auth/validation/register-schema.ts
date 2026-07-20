// features/auth/validation/register-schema.ts

import { z } from "zod";

export const VALID_ROLES = ["Athlete", "Trainer", "Crew", "Business"] as const;
export const VALID_REGIONS = ["北海道", "東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄"] as const;

/** VALID_REGIONS に対応する都道府県一覧（オンボーディングと同定義） */
export const PREFECTURES_BY_REGION: Record<(typeof VALID_REGIONS)[number], readonly string[]> = {
    北海道: ["北海道"],
    東北: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
    関東: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
    中部: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
    近畿: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
    "中国・四国": ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"],
    "九州・沖縄": ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
};

const ALL_PREFECTURES = Object.values(PREFECTURES_BY_REGION).flat() as [string, ...string[]];

export const registerSchema = z
    .object({
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
        region: z.enum(VALID_REGIONS, {
            message: "活動エリア（地方）を選択してください",
        }),
        prefecture: z
            .string()
            .optional()
            .transform((v) => (v === "" || v === undefined ? undefined : v)),
        displayName: z.string().max(50, "表示名は50文字以内で入力してください").optional(),
        slug: z
            .string()
            .min(3, "ユーザー名は3文字以上で入力してください")
            .max(30, "ユーザー名は30文字以内で入力してください")
            .regex(
                /^[a-z0-9_.]+$/,
                "ユーザー名は英小文字・数字・アンダースコア・ドットのみ使用できます（ハイフン不可）"
            ),
        referrerSlug: z.string().optional().transform((v) => (v === "" ? undefined : v)),
        termsAccepted: z.boolean().refine((value) => value === true, {
            message: "利用規約とプライバシーポリシーへの同意が必要です",
        }),
    })
    .superRefine((data, ctx) => {
        if (!data.prefecture) return;
        if (!ALL_PREFECTURES.includes(data.prefecture)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["prefecture"],
                message: "都道府県の選択が不正です",
            });
            return;
        }
        const allowed = PREFECTURES_BY_REGION[data.region];
        if (!allowed.includes(data.prefecture)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["prefecture"],
                message: "選択した地方に属する都道府県を選んでください",
            });
        }
    });

export type RegisterSchema = z.infer<typeof registerSchema>;
