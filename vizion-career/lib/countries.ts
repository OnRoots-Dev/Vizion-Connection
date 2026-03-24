// lib/countries.ts
export interface Country { code: string; name: string; nameJa: string; flag: string; region: string; }

export const COUNTRIES: Country[] = [
  // Asia Pacific
  { code:"JP", name:"Japan",        nameJa:"日本",           flag:"🇯🇵", region:"Asia Pacific" },
  { code:"KR", name:"South Korea",  nameJa:"韓国",           flag:"🇰🇷", region:"Asia Pacific" },
  { code:"CN", name:"China",        nameJa:"中国",           flag:"🇨🇳", region:"Asia Pacific" },
  { code:"AU", name:"Australia",    nameJa:"オーストラリア", flag:"🇦🇺", region:"Asia Pacific" },
  { code:"NZ", name:"New Zealand",  nameJa:"ニュージーランド",flag:"🇳🇿", region:"Asia Pacific" },
  { code:"TH", name:"Thailand",     nameJa:"タイ",           flag:"🇹🇭", region:"Asia Pacific" },
  { code:"SG", name:"Singapore",    nameJa:"シンガポール",   flag:"🇸🇬", region:"Asia Pacific" },
  { code:"ID", name:"Indonesia",    nameJa:"インドネシア",   flag:"🇮🇩", region:"Asia Pacific" },
  { code:"PH", name:"Philippines",  nameJa:"フィリピン",     flag:"🇵🇭", region:"Asia Pacific" },
  { code:"MY", name:"Malaysia",     nameJa:"マレーシア",     flag:"🇲🇾", region:"Asia Pacific" },
  { code:"VN", name:"Vietnam",      nameJa:"ベトナム",       flag:"🇻🇳", region:"Asia Pacific" },
  { code:"IN", name:"India",        nameJa:"インド",         flag:"🇮🇳", region:"Asia Pacific" },
  // Europe
  { code:"GB", name:"United Kingdom",nameJa:"イギリス",      flag:"🇬🇧", region:"Europe" },
  { code:"DE", name:"Germany",      nameJa:"ドイツ",         flag:"🇩🇪", region:"Europe" },
  { code:"FR", name:"France",       nameJa:"フランス",       flag:"🇫🇷", region:"Europe" },
  { code:"IT", name:"Italy",        nameJa:"イタリア",       flag:"🇮🇹", region:"Europe" },
  { code:"ES", name:"Spain",        nameJa:"スペイン",       flag:"🇪🇸", region:"Europe" },
  { code:"NL", name:"Netherlands",  nameJa:"オランダ",       flag:"🇳🇱", region:"Europe" },
  { code:"PT", name:"Portugal",     nameJa:"ポルトガル",     flag:"🇵🇹", region:"Europe" },
  { code:"BE", name:"Belgium",      nameJa:"ベルギー",       flag:"🇧🇪", region:"Europe" },
  { code:"CH", name:"Switzerland",  nameJa:"スイス",         flag:"🇨🇭", region:"Europe" },
  { code:"AT", name:"Austria",      nameJa:"オーストリア",   flag:"🇦🇹", region:"Europe" },
  { code:"SE", name:"Sweden",       nameJa:"スウェーデン",   flag:"🇸🇪", region:"Europe" },
  { code:"NO", name:"Norway",       nameJa:"ノルウェー",     flag:"🇳🇴", region:"Europe" },
  { code:"DK", name:"Denmark",      nameJa:"デンマーク",     flag:"🇩🇰", region:"Europe" },
  { code:"PL", name:"Poland",       nameJa:"ポーランド",     flag:"🇵🇱", region:"Europe" },
  { code:"GR", name:"Greece",       nameJa:"ギリシャ",       flag:"🇬🇷", region:"Europe" },
  { code:"TR", name:"Turkey",       nameJa:"トルコ",         flag:"🇹🇷", region:"Europe" },
  { code:"HR", name:"Croatia",      nameJa:"クロアチア",     flag:"🇭🇷", region:"Europe" },
  { code:"RU", name:"Russia",       nameJa:"ロシア",         flag:"🇷🇺", region:"Europe" },
  // Americas
  { code:"US", name:"United States",nameJa:"アメリカ",       flag:"🇺🇸", region:"Americas" },
  { code:"CA", name:"Canada",       nameJa:"カナダ",         flag:"🇨🇦", region:"Americas" },
  { code:"BR", name:"Brazil",       nameJa:"ブラジル",       flag:"🇧🇷", region:"Americas" },
  { code:"AR", name:"Argentina",    nameJa:"アルゼンチン",   flag:"🇦🇷", region:"Americas" },
  { code:"MX", name:"Mexico",       nameJa:"メキシコ",       flag:"🇲🇽", region:"Americas" },
  { code:"CO", name:"Colombia",     nameJa:"コロンビア",     flag:"🇨🇴", region:"Americas" },
  { code:"CL", name:"Chile",        nameJa:"チリ",           flag:"🇨🇱", region:"Americas" },
  { code:"UY", name:"Uruguay",      nameJa:"ウルグアイ",     flag:"🇺🇾", region:"Americas" },
  // Middle East & Africa
  { code:"AE", name:"UAE",          nameJa:"UAE",            flag:"🇦🇪", region:"Middle East" },
  { code:"SA", name:"Saudi Arabia", nameJa:"サウジアラビア", flag:"🇸🇦", region:"Middle East" },
  { code:"QA", name:"Qatar",        nameJa:"カタール",       flag:"🇶🇦", region:"Middle East" },
  { code:"ZA", name:"South Africa", nameJa:"南アフリカ",     flag:"🇿🇦", region:"Africa" },
  { code:"NG", name:"Nigeria",      nameJa:"ナイジェリア",   flag:"🇳🇬", region:"Africa" },
  { code:"GH", name:"Ghana",        nameJa:"ガーナ",         flag:"🇬🇭", region:"Africa" },
  { code:"MA", name:"Morocco",      nameJa:"モロッコ",       flag:"🇲🇦", region:"Africa" },
  { code:"SN", name:"Senegal",      nameJa:"セネガル",       flag:"🇸🇳", region:"Africa" },
];

export const COUNTRIES_BY_REGION = COUNTRIES.reduce<Record<string, Country[]>>((acc, c) => {
  if (!acc[c.region]) acc[c.region] = [];
  acc[c.region].push(c);
  return acc;
}, {});

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}
