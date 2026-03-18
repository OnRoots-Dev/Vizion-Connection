// components/ProfileCardView.tsx（新規）
"use client";

import { ProfileCardSection } from "@/app/(app)/dashboard/components/ProfileCard";
import type { PublicProfileData } from "@/features/profile/types";

export default function ProfileCardView({ profile }: { profile: PublicProfileData }) {
  return (
    <div id="profile-card-share">
      <ProfileCardSection profile={profile as any} />
    </div>
  );
}