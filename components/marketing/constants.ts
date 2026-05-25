// ─── Role config ──────────────────────────────────────────────────────────────
export const ROLES = {
  athlete: { rc: "rgba(255,70,70,0.9)", rg: "rgba(220,40,40,0.55)", rl: "#FF4646", bg0: "#130303", bg1: "#280808", label: "Athlete", name: "Inoue Yuji", spec: "Track & Field · 100m / 200m", region: "東京 / JP", memberId: "VZ00000-0000-00000", cheer: 300, comment: "「限界は、自分が決めるものじゃない。」", url: "vizion.co/u/inoue", photo: "/images/inoue.png", backPhoto: "" },
  trainer: { rc: "rgba(40,210,110,0.9)", rg: "rgba(20,175,80,0.52)", rl: "#28D26E", bg0: "#021008", bg1: "#042018", label: "Trainer", name: "Matsuda Tetsuya", spec: "Strength & Conditioning", region: "大阪 / JP", memberId: "VZ00000-0000-00000", cheer: 250, comment: "「体を鍛えることは、心を鍛えること。」", url: "vizion.co/u/matsuda", photo: "/images/matsuda.png", backPhoto: "" },
  business: { rc: "rgba(50,130,255,0.9)", rg: "rgba(30,100,230,0.52)", rl: "#3282FF", bg0: "#020b18", bg1: "#051c38", label: "Business", name: "株式会社 KSB", spec: "Sports Marketing · CEO", region: "福岡 / 福岡市 / JP", memberId: "VZ00000-0000-00000", cheer: 512, comment: "「スポーツの力を、もっと社会へ。」", url: "vizion.co/u/KSB", photo: "/images/ksb.png", backPhoto: "" },
  member: { rc: "rgba(255,195,20,0.9)", rg: "rgba(220,165,0,0.52)", rl: "#FFC314", bg0: "#0e0900", bg1: "#221500", label: "Crew", name: "Hana Suzuki", spec: "Sports Fan · Supporter", region: "神奈川 / 横浜市 / JP", memberId: "VZ00000-0000-00000", cheer: 88, comment: "「応援することが、私の競技だ。」", url: "vizion.co/u/hana", photo: "/images/hana.png", backPhoto: "" },
} as const;

export type RoleKey = keyof typeof ROLES;

// ─── Champion Partner Slots ───────────────────────────────────────────────────
export const CHAMPION_SLOTS: Array<{ filled: boolean; name?: string; logo?: string }> = [
  { filled: false },
  { filled: false },
  { filled: false },
  { filled: false },
  { filled: false },
];

// ─── Who is this for tabs ─────────────────────────────────────────────────────
export const WHO_FOR_TABS = [
  {
    key: "athlete",
    label: "Athlete",
    color: "#FF4646",
    icon: "🏃",
    subtitle: "競技者として活動する人",
    desc: "あなたの活動や挑戦をプロフィールとして可視化。",
    tags: ["試合", "トレーニング", "キャリア"],
    body: "すべてをひと目で伝えられます。",
  },
  {
    key: "trainer",
    label: "Trainer",
    color: "#28D26E",
    icon: "🎓",
    subtitle: "指導者・専門家",
    desc: "指導分野・経験・実績を公開し、アスリートとつながることができます。",
    tags: ["指導分野", "経験", "実績"],
    body: "あなたの専門性が、次の出会いへの道になります。",
  },
  {
    key: "members",
    label: "Crew",
    color: "#FFC314",
    icon: "🌟",
    subtitle: "支援者 / コネクター",
    desc: "応援・紹介・コミュニティ参加を通じ、スポーツの世界に新しいつながりを生み出します。",
    tags: ["応援", "紹介", "コミュニティ参加"],
    body: "あなたの「応援」が、誰かの信頼になる。",
  },
  {
    key: "business",
    label: "Business",
    color: "#3282FF",
    icon: "🤝",
    subtitle: "スポンサー / パートナー企業",
    desc: "スポーツコミュニティと直接つながる新しいスポンサー体験。",
    tags: ["スポンサー", "コラボ", "共創"],
    body: "アスリートやコミュニティと共創の機会を生み出します。",
  },
] as const;

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export const FAQ_ITEMS = [
  {
    q: "登録は無料ですか？",
    a: "はい。Athlete・Trainer・Crew・Businessすべてのロールで無料で登録・利用できます。",
  },
  {
    q: "Businessプランとは何ですか？",
    a: "アスリートへの広告掲載・Discovery優先表示・効果測定が利用できる企業向けプランです。詳細は /business をご覧ください。※現在、Businessプランは一時的に新規受付を停止しています。再開は、2026年5月26日を予定しています。",
  },
  {
    q: "Founding Memberの枠はいつ埋まりますか？",
    a: "先着100名限定です。枠がなくなり次第、Founding Member登録は終了します。",
  },
];
