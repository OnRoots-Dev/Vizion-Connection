/**
 * 通知の共有型（型のみ・サーバー実装を含まない）。
 * client / server 両方から import する。サービスロール等は一切含まない。
 */
export type NotificationType =
  | "cheer_received"
  | "business_checkout_submitted"
  | "mission_reward_granted"
  | "news"
  | "bond"
  | "activity_created"
  | "moment_created";
