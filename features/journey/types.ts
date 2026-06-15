// features/journey/types.ts
// Journey（活動記録）の共有型。journeys テーブル 1 行に対応。

export interface JourneyEntry {
    id: string;
    user_slug: string;
    content: string;
    condition_score: number | null;
    image_url: string | null;
    video_url: string | null;
    tags: string[];
    is_public: boolean;
    cheer_count: number;
    created_at: string;
}

export interface JourneyListResponse {
    journeys: JourneyEntry[];
}
