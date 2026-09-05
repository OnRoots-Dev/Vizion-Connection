// lib/ratelimit.ts

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type RatelimitResult = Awaited<ReturnType<Ratelimit["limit"]>>;

/**
 * Upstash 障害時のフェイルセーフ。
 * Redis が到達不能な場合、limit() が throw すると全 mutation ルートが
 * 未捕捉例外で 500 になる（2026-08-25 実障害: Upstash DB 消滅で DNS 不解決）。
 * fail-open（制限なしで通過＋エラーログ）とすることでアプリ全体を守る。
 * Upstash 復旧後は自動的に通常のレート制限へ戻る。
 */
function safe(limiter: Ratelimit, name: string): { limit(identifier: string): Promise<RatelimitResult> } {
    return {
        limit(identifier: string): Promise<RatelimitResult> {
            return limiter.limit(identifier).catch((e: unknown) => {
                console.error(`[ratelimit:${name}] unavailable — fail-open:`, e instanceof Error ? e.message : e);
                return { success: true } as RatelimitResult;
            });
        },
    };
}

// 登録：1時間に10回（IP+email複合キー）
export const registerLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:register",
}), "register");

// 認証メール再送：1時間に5回
export const resendLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:resend",
}), "resend");

// ログイン：15分に10回
export const loginLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "15 m"), prefix: "rl:login",
}), "login");

// お問い合わせ：1時間に3回
export const contactLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "rl:contact",
}), "contact");

// Cheer：1分に10回
export const cheerLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:cheer",
}), "cheer");

// アカウント変更系：1時間に5回
export const accountLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:account",
}), "account");

// プロフィール保存：1分に10回
export const profileLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:profile",
}), "profile");

// キャリアプロフィール保存：1分に10回
export const careerProfileLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:career-profile",
}), "career-profile");

// スケジュール作成/更新/削除：1分に20回
export const scheduleLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: "rl:schedule",
}), "schedule");

// ビジネス決済：1時間に10回
export const businessLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:business",
}), "business");

// ビジネス決済完了（webhookフォールバック）：1時間に20回
export const businessCompleteLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(20, "1 h"), prefix: "rl:business-complete",
}), "business-complete");

// Business Monetization P0（Hub / Locations / Campaigns）：1分に30回
export const monetizeLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(30, "1 m"), prefix: "rl:monetize",
}), "monetize");

// ミッション：1時間に5回
export const missionLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:mission",
}), "mission");

// シェア：1時間に10回
export const shareLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:share",
}), "share");

// Journey投稿：1時間に10回（1日1回制限は route 側で管理）
export const journeyLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:journey",
}), "journey");

// Bond（フォロー/解除）：1分に30回
export const bondLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(30, "1 m"), prefix: "rl:bond",
}), "bond");

// discovery track：1分に60回
export const discoveryTrackLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(60, "1 m"), prefix: "rl:discovery-track",
}), "discovery-track");

// ニュースCheer（未認証カウンタ）：1分に10回/IP
export const newsCheerLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:news-cheer",
}), "news-cheer");

// ニュースコメント：1分に10回
export const newsCommentLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:news-comment",
}), "news-comment");

// 通知既読：1分に30回
export const notificationLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(30, "1 m"), prefix: "rl:notif",
}), "notif");

// オンボーディング完了：1時間に10回
export const onboardingLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:onboarding",
}), "onboarding");

// パスワードリセット：IP 10分に5回, Email 10分に3回
export const resetIpLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(5, "10 m"), prefix: "rl:reset:ip",
}), "reset-ip");
export const resetEmailLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(3, "10 m"), prefix: "rl:reset:email",
}), "reset-email");

// Activity作成/更新/削除：1分に20回
export const activityLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: "rl:activity",
}), "activity");

// Place作成/検索：1分に30回
export const placeLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(30, "1 m"), prefix: "rl:place",
}), "place");

// Moment投稿：1時間に20回
export const momentLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(20, "1 h"), prefix: "rl:moment",
}), "moment");

// Momentコメント：1分に10回
export const momentCommentLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:moment-comment",
}), "moment-comment");

// Moment Cheer：1分に20回
export const momentCheerLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: "rl:moment-cheer",
}), "moment-cheer");

// Activity Cheer：1分に20回
export const activityCheerLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: "rl:activity-cheer",
}), "activity-cheer");

// Activity コメント：1分に10回
export const activityCommentLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:activity-comment",
}), "activity-comment");

// Activity Together 参加 / 応答：1分に20回
export const activityParticipantLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: "rl:activity-participant",
}), "activity-participant");

// Connection申請/承認/解除：1分に10回
export const connectionLimiter = safe(new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:connection",
}), "connection");

// IPを取得するヘルパー
export function getIp(req: Request): string {
    const xff = req.headers.get("x-forwarded-for");
    return xff ? xff.split(",")[0].trim() : "unknown";
}
