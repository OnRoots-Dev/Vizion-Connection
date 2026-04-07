"use client";

import { EditProfileClient } from "@/app/(app)/dashboard/edit/EditProfileClient";
import type { ProfileData } from "@/features/profile/types";
import type { ThemeColors } from "@/app/(app)/dashboard/types";

export function EditView({ profile, t: _t, roleColor: _rc, onBack, onSave }: {
    profile: ProfileData;
    t: ThemeColors;
    roleColor: string;
    onBack: () => void;
    onSave: (p?: ProfileData) => void | Promise<void>;
}) {
    return (
        <EditProfileClient
            user={profile as any}
            onSaved={onSave}
            onBack={onBack}
        />
    );
}
