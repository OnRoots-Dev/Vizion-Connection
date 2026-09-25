const BLOCKED_PATTERNS = [
    /ばか/i,
    /死ね/i,
    /殺す/i,
    /消えろ/i,
    /くたばれ/i,
    /(?:https?:\/\/)?(?:www\.)?(?:pornhub|xvideos|xnxx)\./i,
];

/** MVP用の簡易ブロック。外部モデレーションAPIは呼び出さない。 */
export function moderateActivityComment(body: string): { allowed: boolean } {
    const normalized = body.normalize("NFKC");
    return { allowed: !BLOCKED_PATTERNS.some((pattern) => pattern.test(normalized)) };
}
