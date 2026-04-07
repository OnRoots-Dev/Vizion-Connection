import { getVoiceLabPosts, getVoiceLabUserUpvotes } from "@/lib/voicelab";
import VoiceLabClient from "./VoiceLabClient";
import { getOptionalSessionUser } from "@/lib/auth/get-optional-session-user";
import { getAdsForUser } from "@/lib/ads";
import { canManageVoiceLabByEmail } from "@/lib/auth/voicelab-admin";

export const dynamic = "force-dynamic";

export default async function VoiceLabPage() {
    const sessionUser = await getOptionalSessionUser();
    const session = sessionUser ? { userId: String(sessionUser.id) } : null;
    const canManageVoiceLab = canManageVoiceLabByEmail(sessionUser?.email);

    const [posts, upvotedIds, ads] = await Promise.all([
        getVoiceLabPosts(),
        session ? getVoiceLabUserUpvotes(Number(session.userId)) : Promise.resolve([] as string[]),
        getAdsForUser(sessionUser?.prefecture ?? "", sessionUser?.sport ?? undefined),
    ]);

    return (
        <VoiceLabClient
            initialPosts={posts}
            initialUpvotedIds={upvotedIds}
            canPost={Boolean(session)}
            ads={ads}
            canManageVoiceLab={canManageVoiceLab}
        />
    );
}
