export type OpenlabCategory = "feature" | "bug" | "idea" | "other";
export type OpenlabStatus = "open" | "reviewing" | "planned" | "done";

export interface OpenlabPost {
    id: string;
    userId: number | null;
    category: OpenlabCategory;
    title: string;
    body: string;
    upvotes: number;
    status: OpenlabStatus;
    createdAt: string;
    user?: {
        id: number;
        slug: string;
        displayName: string;
        role: string;
    } | null;
}

export const OPENLAB_CATEGORY_LABEL: Record<OpenlabCategory, string> = {
    feature: "機能要望",
    bug: "バグ報告",
    idea: "アイデア",
    other: "その他",
};

export const OPENLAB_STATUS_LABEL: Record<OpenlabStatus, string> = {
    open: "受付中",
    reviewing: "検討中",
    planned: "実装予定",
    done: "完了",
};
