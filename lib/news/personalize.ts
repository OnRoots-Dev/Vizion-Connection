const CATEGORY_KEYWORDS: Record<string, string> = {
  "球技（ゴール型）": "サッカー バスケットボール ラグビー",
  "球技（ネット・ベース型）": "テニス バレーボール 野球 卓球",
  "武道・格闘技": "柔道 ボクシング 格闘技 空手",
  "陸上・水泳": "陸上競技 競泳 マラソン",
  "アーバン・ダンス": "スケートボード クライミング ブレイキン",
  "ウィンター": "スキー スノーボード フィギュアスケート",
  "その他": "eスポーツ モータースポーツ サーフィン",
};

export interface NewsSection {
  label: string;
  keyword: string;
}

export function buildKeywords(user: {
  role: string;
  sport?: string | null;
  sports_category?: string | null;
}): NewsSection[] {
  const healthSection: NewsSection = {
    label: "トレーニング・健康",
    keyword: "トレーニング 健康 スポーツ医学",
  };

  switch (user.role) {
    case "Athlete": {
      const sport =
        user.sport || CATEGORY_KEYWORDS[user.sports_category ?? ""] || "スポーツ";
      return [
        { label: `${sport}のニュース`, keyword: sport },
        healthSection,
      ];
    }

    case "Trainer":
      return [
        { label: "スポーツ・競技", keyword: "スポーツ 競技 アスリート" },
        {
          label: "トレーニング・健康",
          keyword: "トレーニング 健康 スポーツ医学 リハビリ",
        },
      ];

    case "Members":
      return [
        { label: "スポーツ・競技", keyword: "スポーツ 競技 アスリート" },
        { label: "トレーニング・健康", keyword: "トレーニング 健康" },
      ];

    case "Business":
      return [
        { label: "スポーツのニュース", keyword: "スポーツ 競技" },
        { label: "健康・ウェルネス", keyword: "健康 ウェルネス フィットネス" },
        {
          label: "スポーツビジネス",
          keyword: "スポーツビジネス スポンサー マーケティング",
        },
      ];

    default:
      return [{ label: "スポーツのニュース", keyword: "スポーツ" }, healthSection];
  }
}
