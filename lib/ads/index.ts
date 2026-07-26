// lib/ads — 広告ドメインの入口
// `@/lib/ads` → getAdsForUser（既存 import 互換）
// スロット設定・注入: `@/lib/ads/adSlots` / `@/lib/ads/adSlotUtils`

export { getAdsForUser } from "@/lib/ads/get-ads";
export {
  AD_CONFIG,
  type AdTier,
  type SlotType,
} from "@/lib/ads/adSlots";
export {
  injectAdsIntoFeed,
  isAdSlot,
  pickLocalSlotTier,
} from "@/lib/ads/adSlotUtils";
