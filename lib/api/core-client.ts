// lib/api/core-client.ts
// Core UX（Activity/Moment/Place/Connection/VizMap）用の型付きfetchラッパー。
// CSRF は same-origin fetch の Origin ヘッダーで server 側 validateCSRF が検証する。
"use client";

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function parse<T>(res: Response): Promise<T> {
    let data: unknown = null;
    try {
        data = await res.json();
    } catch {
        /* non-json */
    }
    const body = (data ?? {}) as { success?: boolean; error?: string };
    if (!res.ok || body.success === false) {
        throw new ApiError(res.status, body.error ?? `Request failed (${res.status})`);
    }
    return data as T;
}

export async function apiGet<T>(url: string): Promise<T> {
    return parse<T>(await fetch(url, { credentials: "same-origin" }));
}

export async function apiSend<T>(
    url: string,
    method: "POST" | "PATCH" | "DELETE",
    body?: unknown,
): Promise<T> {
    const res = await fetch(url, {
        method,
        credentials: "same-origin",
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return parse<T>(res);
}
