import { ALL_PREFECTURES } from "@/features/place/geocode";
import { supabaseServer } from "@/lib/supabase/server";

export type RegionUserCount = {
  prefecture: string;
  userCount: number;
};

/** Counts active registered users by prefecture without selecting profile data. */
export async function listUserCountsByPrefecture(): Promise<RegionUserCount[]> {
  const counts = new Map<string, number>(ALL_PREFECTURES.map((prefecture) => [prefecture, 0]));
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const { data, error } = await supabaseServer
      .from("users")
      .select("prefecture")
      .eq("is_deleted", false)
      .not("prefecture", "is", null)
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("[listUserCountsByPrefecture]", error.code);
      throw new Error("REGION_USER_COUNTS_QUERY_FAILED");
    }

    const rows = (data ?? []) as Array<{ prefecture: string | null }>;
    for (const row of rows) {
      const prefecture = row.prefecture?.trim();
      if (prefecture) counts.set(prefecture, (counts.get(prefecture) ?? 0) + 1);
    }

    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  const prefectureOrder = new Map(ALL_PREFECTURES.map((prefecture, index) => [prefecture, index]));
  return Array.from(counts, ([prefecture, userCount]) => ({ prefecture, userCount })).sort(
    (a, b) => (prefectureOrder.get(a.prefecture) ?? Number.MAX_SAFE_INTEGER)
      - (prefectureOrder.get(b.prefecture) ?? Number.MAX_SAFE_INTEGER)
      || a.prefecture.localeCompare(b.prefecture, "ja"),
  );
}
