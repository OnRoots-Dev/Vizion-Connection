-- Add region (地方ブロック) to business_orders for Roots per-block seat tracking.
-- Nullable: Signal / Presence / Legacy are nationwide plans and do not set a region;
-- existing rows have no region. No data migration required (Roots completed count = 0).
ALTER TABLE business_orders ADD COLUMN IF NOT EXISTS region text;

COMMENT ON COLUMN business_orders.region IS
    '地方ブロックID（Rootsプランのみ）: hokkaido_tohoku / kanto / chubu / kinki / chugoku_shikoku / kyushu_okinawa。全国プラン(Signal/Presence/Legacy)はNULL。';
