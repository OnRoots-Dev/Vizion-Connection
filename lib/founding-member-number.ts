export const FOUNDING_MEMBER_NUMBER_BASE = 231;

export function getFoundingMemberNumber(userId: number | string): number {
  const id = Number(userId);
  if (!Number.isFinite(id)) return 0;
  return id - FOUNDING_MEMBER_NUMBER_BASE;
}
