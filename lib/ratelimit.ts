// lib/ratelimit.ts

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 登録：1時間に10回（IP+email複合キー）
export const registerLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:register",
});

// 認証メール再送：1時間に5回
export const resendLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:resend",
});

// ログイン：15分に10回
export const loginLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "15 m"), prefix: "rl:login",
});

// お問い合わせ：1時間に3回
export const contactLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "rl:contact",
});

// Cheer：1分に10回
export const cheerLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:cheer",
});

// アカウント変更系：1時間に5回
export const accountLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:account",
});

// プロフィール保存：1分に10回
export const profileLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:profile",
});

// スケジュール作成/更新/削除：1分に20回
export const scheduleLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(20, "1 m"), prefix: "rl:schedule",
});

// ビジネス決済：1時間に10回
export const businessLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:business",
});

// ミッション：1時間に5回
export const missionLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:mission",
});

// シェア：1時間に10回
export const shareLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:share",
});

// Journey投稿：1時間に10回（1日1回制限は route 側で管理）
export const journeyLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:journey",
});

// Bond（フォロー/解除）：1分に30回
export const bondLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(30, "1 m"), prefix: "rl:bond",
});

// discovery track：1分に60回
export const discoveryTrackLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(60, "1 m"), prefix: "rl:discovery-track",
});

// ニュースCheer（未認証カウンタ）：1分に10回/IP
export const newsCheerLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:news-cheer",
});

// ニュースコメント：1分に10回
export const newsCommentLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:news-comment",
});

// 通知既読：1分に30回
export const notificationLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(30, "1 m"), prefix: "rl:notif",
});

// オンボーディング完了：1時間に10回
export const onboardingLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(10, "1 h"), prefix: "rl:onboarding",
});

// パスワードリセット：IP 10分に5回, Email 10分に3回
export const resetIpLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(5, "10 m"), prefix: "rl:reset:ip",
});
export const resetEmailLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(3, "10 m"), prefix: "rl:reset:email",
});

// IPを取得するヘルパー
export function getIp(req: Request): string {
    const xff = req.headers.get("x-forwarded-for");
    return xff ? xff.split(",")[0].trim() : "unknown";
}
