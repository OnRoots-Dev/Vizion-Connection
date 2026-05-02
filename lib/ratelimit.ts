// lib/ratelimit.ts

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 登録：10分に3回
export const registerLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(3, "10 m"), prefix: "rl:register",
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

// discovery track：1分に60回
export const discoveryTrackLimiter = new Ratelimit({
    redis, limiter: Ratelimit.slidingWindow(60, "1 m"), prefix: "rl:discovery-track",
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
