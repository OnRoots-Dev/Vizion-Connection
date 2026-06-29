"use client";

import CheerButton from "@/components/ui/CheerButton";
import { dispatchPublicProfileEngagement } from "./engagement-events";

interface Props {
    slug: string;
    initialCheerCount: number;
    roleColor: string;
    isOwn: boolean;
}

export default function CheerButtonClient({ slug, initialCheerCount, roleColor, isOwn }: Props) {
    return (
        <CheerButton
            slug={slug}
            initialCount={initialCheerCount}
            roleColor={roleColor}
            isOwn={isOwn}
            showCommentBox
            onCheer={(newCount) => dispatchPublicProfileEngagement({ slug, cheerCount: newCount })}
        />
    );
}

