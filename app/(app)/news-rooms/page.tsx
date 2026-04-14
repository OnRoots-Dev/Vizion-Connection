"use client";

import NewsRoomsContent from "@/app/(app)/news-rooms/components/NewsRoomsContent";

export default function NewsRoomsPage() {
    return (
        <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
            <div className="mx-auto w-full max-w-4xl space-y-5">
                <NewsRoomsContent title="News Rooms" />
            </div>
        </main>
    );
}
