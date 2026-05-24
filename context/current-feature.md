# Show user's pattern alignments throughout app

## Parent Branch

(none — branch off `main`)

## Summary

Surface each user's NEO pattern type alignments in two places in the mobile
app — the recommendations dashboard and the activity detail screen — so users
(especially those who haven't entered interests) can see the personality-based
rationale for their matches.

### Dashboard

- Above the recommendations list, render the user's **top three** matching NEO
  pattern types, computed from `getUserPatternWeights`.
- Each pattern is shown as an animated circular progress ring containing the
  match percentage (0–100, derived from the 0–1 weight × 100, rounded).
- Pattern name renders directly below each ring.
- Section heading: **"Your highest matching personality patterns."**
- Subheading: **"Tap to learn more about each pattern."**
- The ring progress animates on screen mount.

### Activity Detail

- Show the single NEO pattern type that best explains the match between this
  activity and this user.
- Copy: **"You were matched because you scored highly as a {patternName}."**
- Render inside a shaded grey container styled as an accordion: collapsed by
  default with a **"See more"** affordance; expanding reveals the pattern's
  `shortDescription`.

## Requirements

### Backend (`packages/core`)

1. Expose the user's pattern weights to the mobile client.
   - Option A: extend `GET /recommendations` response to include
     `patternWeights: Record<PatternTypeId, number>` (0–1 floats).
   - Option B: add `GET /pattern-weights` returning the same shape.
   - Pick whichever fits the existing handler patterns; default to Option A
     to minimise round-trips on dashboard mount.
2. Determine, for each returned recommendation, the **dominant pattern** —
   the pattern ID from `ACTIVITY_TYPE_PATTERNS[rec.type] ∪
   related_types→patterns` with the highest user pattern weight.
   - Only set `dominantPatternId` if that highest weight is **≥ 0.6**;
     otherwise return `null`. The user-facing copy ("You were matched
     because you scored highly as a…") would be misleading for sub-0.6
     matches, so the UI must hide the accordion in that case.
   - Surface as `dominantPatternId: PatternTypeId | null` on each
     recommendation in the response (extend `ScoredRecommendation` or the
     response DTO; do not mutate the `Activity` type).
   - Threshold lives as an exported constant in the shared helper
     (e.g. `MIN_DOMINANT_WEIGHT = 0.6`) so backend + mobile use the same
     value.
3. Add unit tests in `recommendation-algorithm.test.ts` (or a new sibling
   test file) covering:
   - Top-3 pattern selection from `getUserPatternWeights`.
   - Dominant-pattern resolution for an activity with and without
     `related_types`.

### Shared types (`packages/types`)

1. Re-export `PATTERN_TYPES`, `PatternType`, and `PatternTypeId` from a path
   the mobile app can import (verify current exports first).
2. Add response DTO additions (`patternWeights`, `dominantPatternId`) to the
   recommendations response type if one is shared.

### Mobile — Dashboard (`apps/mobile/app/(authed)/recommendations/index.tsx`)

1. On screen mount, read `patternWeights` from the recommendations response.
2. Compute the top three pattern IDs by weight (ties: lower `id` wins for
   determinism).
3. Resolve each ID to its `name` via `PATTERN_TYPES`.
4. Render a new section above the recommendations list with:
   - Heading: "Your highest matching personality patterns."
   - Subheading: "Tap to learn more about each pattern."
   - Three circular percentage rings (use `react-native-svg`; respect
     NativeWind for layout/colour tokens).
   - Animation: ring fills from 0 → percentage on mount
     (`react-native-reanimated`, ~600–900 ms).
   - Each ring is tappable. Tap behaviour: open a modal/sheet (or navigate
     to a pattern detail route — pick the lowest-friction option that
     doesn't require new routing infrastructure) showing the pattern's
     `name` and `shortDescription`.
5. Handle the empty-state where personality scores aren't loaded yet
   (skeleton or hide the section until weights arrive).

### Mobile — Activity Detail (`apps/mobile/app/(authed)/activities/[slug].tsx`)

1. Resolve `dominantPatternId` for the current user + activity via a
   **shared cache/context** — do **not** pass it through route params.
   - The recommendations dashboard response populates the cache with
     `patternWeights` (and optionally per-recommendation
     `dominantPatternId`s) when it loads.
   - On activity detail mount, read from the cache:
     - **Cache hit** (user came from dashboard or visited any
       recommendations screen this session): resolve `dominantPatternId`
       from cached `patternWeights` + `ACTIVITY_TYPE_PATTERNS` immediately
       — no network call.
     - **Cache miss** (cold deep link, app restart, cache invalidated):
       trigger a refetch to repopulate `patternWeights`. The activity
       detail screen must own this refetch (not assume the dashboard ran
       first). Show a skeleton/placeholder in the accordion slot until
       weights arrive; do not flash empty/incorrect copy.
   - Compute logic (shared with backend, see requirement #2 below): for
     the activity's primary `type` and `related_types`, look up
     `ACTIVITY_TYPE_PATTERNS`, then pick the pattern ID with the highest
     user weight from `patternWeights`.
   - Refetch source: reuse the recommendations endpoint if it returns
     `patternWeights` (Backend Option A), or hit a dedicated lightweight
     `GET /pattern-weights` endpoint (Backend Option B) — the lighter
     endpoint is preferred for the cold-load case so we don't refetch the
     full recommendations list just to populate one accordion. Decide
     based on existing data-fetching patterns in the app.
2. Extract the dominant-pattern resolution into a shared helper (e.g.
   `packages/core/src/lib/helpers/dominant-pattern.ts`) so backend and
   mobile call the same function, avoiding logic drift.
3. Render a shaded grey container (use existing theme tokens; do not
   hardcode greys) containing:
   - Default text: "You were matched because you scored highly as a
     {patternName}." with a **"See more"** affordance.
   - Expanded state: same text plus the pattern's `shortDescription`.
4. Accordion behaviour: animated expand/collapse using
   `react-native-reanimated` (or `LayoutAnimation` if simpler) with a chevron
   that rotates on toggle.
5. If the resolution returns no pattern (empty `ACTIVITY_TYPE_PATTERNS`
   entry, missing weights), hide the box entirely (no fallback copy).

### Tests

- Unit-test pattern-weight → top-3 selection and dominant-pattern resolution
  in `packages/core`.
- Snapshot or component test for the dashboard pattern section (rings render
  with correct percentages and names).
- Component test for the activity detail accordion (expand/collapse toggles
  the short description).

## Notes

- `getUserPatternWeights` lives in
  [packages/core/src/lib/helpers/patterns.ts](packages/core/src/lib/helpers/patterns.ts);
  pattern metadata (name, shortDescription, traits) is in
  [packages/types/constants.ts](packages/types/constants.ts).
- Existing recommendations handler:
  [packages/core/src/recommendations/route.ts](packages/core/src/recommendations/route.ts).
- Dashboard screen:
  [apps/mobile/app/(authed)/recommendations/index.tsx](apps/mobile/app/(authed)/recommendations/index.tsx).
- Activity detail screen:
  [apps/mobile/app/(authed)/activities/[slug].tsx](apps/mobile/app/(authed)/activities/[slug].tsx).
- **Activity-detail entry from outside the dashboard** (decided): compute
  client-side from `patternWeights` + `ACTIVITY_TYPE_PATTERNS`. Source
  `patternWeights` from a **shared cache/context** rather than route
  params — that way both dashboard-originated and direct-entry navigations
  share the same code path. On cache miss (cold load, restart,
  invalidation), the activity detail screen triggers its own refetch and
  shows a loading state until weights arrive.
- This also pushes us toward Backend Option B (a dedicated
  `GET /pattern-weights` endpoint) so the cache-miss refetch from the
  activity screen doesn't have to pull the entire recommendations list.
- Reanimated is already installed (see `apps/mobile` deps in CLAUDE.md), so
  no new dependency is required for the ring animation or accordion.
- Percentage formatting: round to whole numbers (e.g. `48`, not `48.3`).
