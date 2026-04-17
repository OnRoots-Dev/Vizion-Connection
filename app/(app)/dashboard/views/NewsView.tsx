"use client";

import type { DashboardView, ThemeColors } from "@/app/(app)/dashboard/types";
import { ViewHeader } from "@/app/(app)/dashboard/components/ui";
import NewsRoomsContent from "@/app/(app)/news-rooms/components/NewsRoomsContent";

export function NewsView({
    t,
    roleColor,
    setView,
}: {
    t: ThemeColors;
    roleColor: string;
    setView: (v: DashboardView) => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            <ViewHeader title="News Rooms" sub="ニュース" onBack={() => setView("home")} t={t} roleColor={roleColor} />
            <NewsRoomsContent title="News Rooms" noticeOnly />
        </div>
    );
}
