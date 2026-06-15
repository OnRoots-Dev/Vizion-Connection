// DAYカウント（DAY ○○）の共通計算ロジック。
// 基準日は users.day0_date。未設定の場合は journeys の初回投稿日にフォールバックする。
// 日数はJST基準の暦日差（宣言当日 = DAY 0）。

export function getJstDateKey(date: Date): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

function diffJstDayKeys(fromKey: string, toKey: string): number {
    const from = new Date(`${fromKey}T00:00:00+09:00`).getTime();
    const to = new Date(`${toKey}T00:00:00+09:00`).getTime();
    return Math.round((to - from) / 86400000);
}

/**
 * DAYカウントを算出する。
 * @param day0Date users.day0_date（優先）
 * @param fallbackEarliest journeys初回投稿日時（day0_dateがnullのときのフォールバック）
 * @returns 経過日数（0以上）。どちらも無ければ null。
 */
export function calcDayCount(
    day0Date?: string | null,
    fallbackEarliest?: string | null,
): number | null {
    const basis = day0Date || fallbackEarliest;
    if (!basis) return null;

    const basisDate = new Date(basis);
    if (Number.isNaN(basisDate.getTime())) return null;

    const days = diffJstDayKeys(getJstDateKey(basisDate), getJstDateKey(new Date()));
    return Math.max(0, days);
}
