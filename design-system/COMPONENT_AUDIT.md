# Component Audit — VIZION NATIVE (2026-09 Second Stage)

Classification:
- A = Vizion-native (Activity/Place/People/Moment/Connection as hero, asymmetry, meaningful media/motion)
- B = Generic but acceptable (utility, form, auth, small primitives, not brand-defining)
- C = AI/SaaS-template-like (card grid, KPI, dashboard, pricing table, generic editorial repetition) — do not reuse

> Rule: C components must be marked `deprecated` / `legacy` / `do-not-use` and not reused for new Vizion surfaces.

| Component | File | Class | Notes / Action |
|---|---|---|---|
| EditorialSection / EditorialHeading / TypographyBand / VizionRule / PlaceStrip / ActivityLedger | `lib/design/editorial.ts` | **A** | Vizion-native primitives. Asymmetric, bleed, map composition. Canonical for marketing LP. |
| VizMapPreview | `components/marketing/lp/viz-map-preview.tsx` | **A** | Map as hero, full-bleed, place pins, live cluster. |
| CoreLoopSection (V2) | `components/marketing/lp/core-loop-section.tsx` | **A** | 5 stages with distinct layouts: ledger left, people right, full-bleed image+type, place strip, map strip. No repetition. |
| MomentsSection (V2) | `components/marketing/lp/moments-section.tsx` | **A** | People/Place/Moment as hero. Asymmetric media, connection line, horizontal moment strip. |
| RoleInActionSection (V2) | `components/marketing/lp/role-in-action.tsx` | **A** | 4 entrances with different densities: Athlete ledger, Trainer people grid, Crew map+liveness, Business place/presence. |
| BusinessPlanSection (V2) | `components/marketing/sections/BusinessPlanSection.tsx` | **A** | Presence over pricing. Varied bleed (left/right), map/report/infinity visuals. |
| Scoreboard (narrative) | `app/u/[slug]/components/Scoreboard.tsx` | **A** | Replaced KPI grid with sentence narrative. |
| HeatPanel / TimelineStack / StatusBar | `app/u/[slug]/components/*` | **A** | Identity → Journey → Activity hierarchy, media-aware. |
| HomeView (WORLD ENTRANCE) | `app/(app)/dashboard/views/HomeView.tsx` | **A-** | World-first ordering (Around You, Moments, Viz Map). Journey is still percent-bar (minor KPI remnant) but not dominant. |
| — | — | — | — |
| Button / Pressable / Avatar / Badge / Chip / Sheet / Field | `components/ui/*`, `lib/design/tokens.ts` | **B** | Generic primitives. Acceptable. Must use tokens. |
| AuthShell / AuthAmbientBg / EyeIcon | `components/auth/*` | **B** | Auth chrome, not brand surfaces. |
| Header / Footer / SiteHeader / SiteFooter | `components/layout/*`, `components/marketing/site-*` | **B** | Navigation chrome. Uses grid-cols-2 for legal links — acceptable utility. |
| Feed / Media / Upload / MapCanvas / PlacePicker | `app/(app)/dashboard/components/*` | **B** | Functional, not editorial. |
| ActivityCard (showcase) | `components/marketing/lp/activity-card.tsx` | **B** | Visual demo only, used inside carousel. No fake metrics. Acceptable. |
| CheerCard | `components/marketing/lp/cheer-card.tsx` | **B** | Demo only, not brand-defining. |
| — | — | — | — |
| RolesSection | `components/marketing/lp/roles-section.tsx` | **C** | **deprecated** — 4-card grid with icon+title+description. Replaced by RoleInActionSection. Do not use. |
| ProfileCard (KPI 3-col) | `components/marketing/lp/profile-card.tsx` | **C** | **deprecated** — KPI stat grid (Activities/Network/Cheers). Use ActivityLedger / narrative instead. |
| RoleBenefitSection (old grid) | `components/marketing/sections/RoleBenefitSection.tsx` | **C** | **deprecated** — repeats RoleInAction with same max-w + spacing + border-t template. Use RoleInActionSection. |
| FeatureSection / CTASection / TrustSection (if grid) | `components/marketing/sections/*` | **C** if grid-cols-2/3 card pattern remains | **do-not-use** for new routes. Migrate to editorial primitives. |
| Business page WHY 2×2 + Plans cards + Comparison table | `app/(marketing)/business/page.tsx` | **C** | **legacy** — SaaS template: 2×2 grid, pricing cards, comparison table. Presence rewrite is in BusinessPlanSection V2. |
| BusinessView KPI 6-grid + AnalyticsChart | `app/(app)/dashboard/views/BusinessView.tsx` | **C** | **legacy** — KPI dashboard. Business presence should be Place/People/Activity, not CTR/CVR grid. Keep for internal ops only. |
| PublicProfileView STATS 3-col | `app/p/[username]/PublicProfileView.tsx` (pre-fix) | **C** | **fixed** — replaced with narrative. Old 3-col is deprecated reference. |
| CollectionCarousel grid | `components/collections/CollectionCarousel.tsx` | **B/C borderline** | If used as card grid, treat as C. Prefer Activity ledger. |

### Enforcement

- AI generation must not reintroduce `grid-cols-2/3/4` for brand sections without Place/Activity/People hero.
- `Card` / `FeatureCard` / `StatCard` / `PricingCard` / `rounded-xl` + `border` + `shadow` + `icon+title+description` patterns are flagged as C.
- New marketing or profile work must import from `lib/design/editorial` (A) or explicitly justify B.

### Migration

- `roles-section.tsx` already has `@deprecated` header and will be removed after LP migration.
- `profile-card.tsx` is showcase-only; not to be used for real profile KPIs.
- `BusinessView.tsx` KPI grid to be replaced by Business presence view in next iteration (Place/People focus).
