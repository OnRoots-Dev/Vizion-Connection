# Pricing & Inventory

Status: **Current implementation, verify production state before operational use.** `features/business/constants.ts` defines plan catalog; `ad_slots` is the inventory authority (`prefecture`, `tier`, `total`, `sold`). Remaining = `total - sold`; an absent slot is unavailable, not an invented default.

Tiers in current code/migrations: `roots`, `signal`, `presence`, `legacy`. Roots uses a prefecture/region selection; national tiers use the national inventory row. Seed data provides an inventory baseline but production DB is authoritative. Do not derive availability from marketing “seats” copy.
