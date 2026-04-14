export type VoiceLabCategory = "feature" | "bug" | "idea" | "other";
export type VoiceLabStatus = "open" | "reviewing" | "planned" | "done";

export interface VoiceLabPost {
    id: string;
    userId: number | null;
    category: VoiceLabCategory;
    title: string;
    body: string;
    upvotes: number;
    status: VoiceLabStatus;
    createdAt: string;
    user?: {
        id: number;
        slug: string;
        displayName: string;
        role: string;
    } | null;
}

export const VOICELAB_CATEGORY_LABEL: Record<VoiceLabCategory, string> = {
    feature: "機能要望",
    bug: "バグ報告",
    idea: "アイデア",
    other: "その他",
};

export const VOICELAB_STATUS_LABEL: Record<VoiceLabStatus, string> = {
    open: "未対応",
    reviewing: "対応中",
    planned: "検討中",
    done: "対応済み",
};
