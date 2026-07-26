'use client'

import { ProfileCardLuxury } from '@/components/ProfileCardLuxury'

export default function Page() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-16 py-16 px-6">
      <div className="text-center space-y-2">
        <h1 className="text-white text-2xl font-medium tracking-tight">
          Vizion Connection
        </h1>
        <p className="text-zinc-500 text-sm">
          Physical 3D Profile Card · Digital Identity
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-14">
        <ProfileCardLuxury
          role="athlete"
          name="黒川 寛将"
          region="神奈川県・横浜"
          title="Track & Field"
          avatarUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
          cardId="VC-ATH-0042"
          memberSince="2026"
          specialTag="FOUNDING MEMBER"
        />
        <ProfileCardLuxury
          role="trainer"
          name="佐藤 美咲"
          region="東京都"
          title="Strength Coach"
          avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
          cardId="VC-TRN-0018"
          memberSince="2026"
          specialTag="EARLY ACCESS"
        />
        <ProfileCardLuxury
          role="fan"
          name="田中 翔"
          region="大阪府"
          title="Supporter"
          avatarUrl="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
          cardId="VC-FAN-0891"
          memberSince="2026"
          specialTag="FOUNDING SUPPORTER"
        />
        <ProfileCardLuxury
          role="business"
          name="株式会社Vizion"
          region="全国"
          title="Official Partner"
          avatarUrl="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop"
          cardId="VC-BIZ-0007"
          memberSince="2026"
          specialTag="OFFICIAL PARTNER"
        />
      </div>
    </div>
  )
}