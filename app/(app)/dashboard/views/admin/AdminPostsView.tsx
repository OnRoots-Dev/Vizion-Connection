"use client";

import { useState } from "react";
import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import PostsView from "@/app/(app)/dashboard/views/admin/PostsView";
import PostEditorView from "@/app/(app)/dashboard/views/admin/PostEditorView";

export function AdminPostsView({
    t,
    roleColor,
    setView,
}: {
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}) {
    const [mode, setMode] = useState<"list" | "editor">("list");
    const [editingPostId, setEditingPostId] = useState<string | null>(null);

    if (mode === "editor") {
        return (
            <PostEditorView
                t={t}
                roleColor={roleColor}
                setView={setView}
                postId={editingPostId}
                onDone={() => {
                    setEditingPostId(null);
                    setMode("list");
                }}
            />
        );
    }

    return (
        <PostsView
            t={t}
            roleColor={roleColor}
            setView={setView}
            onEdit={(postId) => {
                setEditingPostId(postId);
                setMode("editor");
            }}
        />
    );
}
