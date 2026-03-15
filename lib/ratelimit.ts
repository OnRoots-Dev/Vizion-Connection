// lib/ratelimit.ts

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 登録：1IPあたり10分に3回まで
export const registerLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    prefix: "rl:register",
});

// ログイン：1IPあたり15分に10回まで
export const loginLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "15 m"),
    prefix: "rl:login",
});

// お問い合わせ：1IPあたり1時間に3回まで
export const contactLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "rl:contact",
});

// Cheer：1IPあたり1分に10回まで
export const cheerLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "rl:cheer",
});

// IPを取得するヘルパー
export function getIp(req: Request): string {
    const xff = req.headers.get("x-forwarded-for");
    return xff ? xff.split(",")[0].trim() : "unknown";
}