// features/moment/types.ts
import type { ActivityVisibility } from "@/features/activity/types";

export type MomentVisibility = ActivityVisibility;

export interface MomentRecord {
    id: string;
    user_id: number;
    activity_id: string | null;
    body: string;
    image_url: string | null;
    video_url: string | null;
    visibility: MomentVisibility;
    cheer_count: number;
    comment_count: number;
    created_at: string;
    updated_at: string;
}

export interface MomentCommentRecord {
    id: string;
    moment_id: string;
    user_id: number;
    body: string;
    created_at: string;
}

export interface CreateMomentInput {
    body: string;
    image_url?: string | null;
    video_url?: string | null;
    visibility: MomentVisibility;
    activity_id?: string | null;
}

export interface MomentFeedItem {
    moment: MomentRecord;
    author: {
        id: number;
        slug: string;
        display_name: string | null;
        avatar_url: string | null;
    } | null;
    /** 起源Activity（タイトル表示用）。standalone Moment では null */
    activity?: { id: string; title: string | null; type: string } | null;
    place: {
        id: string;
        name: string;
        prefecture: string;
    } | null;
    cheered_by_me: boolean;
}
