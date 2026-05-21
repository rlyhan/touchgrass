# Changelog

## 2026-05-21 — Fix: Handle Activity Detail Back Button with Empty Stack

After moving the detail page to `/activities/[slug]`, deep-linking or refreshing directly on a detail URL meant the navigator had no previous screen to pop. Pressing back triggered React Navigation's "GO_BACK was not handled" warning. The previous detail route at `/recommendations/detail` masked this because Expo Router auto-included the sibling `index.tsx` as the stack's initial route; the new `/activities/` group has no sibling, so the stack contains only the detail screen.

**Mobile (`apps/mobile`)**

- `app/(authed)/activities/[slug].tsx` — Back button now calls a `handleBack` that uses `router.canGoBack()`: pops the stack when there is history, otherwise `router.replace("/recommendations")` to land on the authed home.
- `__tests__/activity-detail.test.tsx` — Mock now exposes `router.replace` and `router.canGoBack`. Old "calls router.back" test split into two cases: `canGoBack === true` → `back()` called, `replace()` not called; `canGoBack === false` → `replace("/recommendations")` called, `back()` not called.

---

## 2026-05-21 — Refactor: Move Activity Detail to a Dynamic Path Segment

The detail page lived at `/recommendations/detail?slug=…`. Slug is the public identifier so it belongs in the URL path, not a query string. Also moves the page out of `/recommendations/` and into `/activities/`, mirroring the backend's `/activities/:slug` endpoint and the entity name.

**Mobile (`apps/mobile`)**

- `app/(authed)/activities/[slug].tsx` (new) — Dynamic route that reads `slug` from `useLocalSearchParams`. Same behaviour as the old detail page; component renamed to `ActivityDetailPage`.
- `app/(authed)/recommendations/detail.tsx` (deleted) — Replaced by the dynamic route above.
- `app/(authed)/recommendations/index.tsx` — Press handler now pushes `/activities/${rec.slug}` instead of `/recommendations/detail?slug=${rec.slug}`.
- `__tests__/activity-detail.test.tsx` (renamed from `recommendations-detail.test.tsx`) — Updated import path to the new file and component name (`ActivityDetailPage`).
- `__tests__/recommendations-index.test.tsx` — Updated press-target assertion to the new URL.

---

## 2026-05-21 — Fix: Fetch Activity Detail by Slug

The detail page previously read from an in-memory cache populated only by the curated top-3 recommendations, so any deep link or refresh (or any slug outside the user's top picks) showed "Activity not found". Adds a `GET /activities/:slug` endpoint backed by the same shared activity source, plus a `fetchActivityBySlug` client that the detail page falls back to when the cache misses. Cache still serves the first paint when the user navigates from the recommendations list.

**Core (`packages/core`)**

- `activities/route.ts` (new) — `getActivityHandler` requires auth; calls `getActivityBySlug(req.params.slug)`; returns `{ activity }` on hit, `404 { error: "Activity not found" }` on miss, `500` on lookup failure.
- `activities/route.test.ts` (new) — Four cases: 200 with body, 404 unknown slug, 401 unauthenticated (handler short-circuits before `getActivityBySlug`), 500 on lookup throw.
- `app.ts` — `AppDeps` now includes `GetActivityDeps`; new route `app.get("/activities/:slug", getActivityHandler(deps))`.
- `index.ts` — Adds `getActivityBySlug` as a local closure over the merged activity loader: `(await loadRecommendations()).find((a) => a.slug === slug) ?? null`. Cheap full-pool scan for now; can be swapped for a Sanity GROQ-by-slug query if/when it matters.
- `app.test.ts`, `onboarding/route.test.ts`, `recommendations/route.test.ts` — Inject a no-op `getActivityBySlug: async () => null` since those suites don't exercise the new route.

**Mobile (`apps/mobile`)**

- `lib/recommendations/api.ts` — New `fetchActivityBySlug(slug)`: hits `GET /activities/:slug` (slug URL-encoded), returns `null` on 404, throws on other non-2xx, and primes the shared `activityCache` on success.
- `app/(authed)/recommendations/detail.tsx` — Reworked around a four-state `ActivityStatus` (`loading | ready | not-found | error`). Cache hit → render immediately. Cache miss → spinner, then network fetch fills the activity or surfaces "Activity not found." / "Couldn't load activity.". Existing extended-fetch behaviour unchanged.
- `__tests__/recommendations-detail.test.tsx` — Three new cases for the not-found describe block (spinner → not-found on null response; spinner → render on hit; spinner → error on reject) and one new "activity found" case asserting that a cache hit short-circuits the network call. Existing tests adapted to the new state machine.

---

## 2026-05-21 — Feat: Add Slug Field to Activity Schema

Adds the `slug` field to the Sanity activity document, mirroring the slug identifier the app now uses. Auto-derived from `title` via Sanity's built-in `slug` type, with the dataset-wide uniqueness check that comes with the type by default. Required field — the merge logic in `core` depends on every Sanity activity having a slug.

**Sanity (`apps/sanity`)**

- `schemaTypes/activity.ts` — New `slug` field positioned right after `title`. `type: 'slug'`, `options.source: 'title'`, `maxLength: 128`, `validation: Rule.required()`. Description note flags that when migrating an existing mock, the slug must match the mock's slug for the merge to take effect.

---

## 2026-05-21 — Feat: Merge Sanity Activities with Mock Fallback

Introduces a loader that merges activities fetched from Sanity with the existing mocks by `slug`, letting Sanity entries override mocks of the same slug and falling back to mocks for slugs not yet migrated. Sets up the integration point for the real Sanity client without yet wiring it in.

**Core (`packages/core`)**

- `recommendations/source.ts` (new) — `createRecommendationLoader(fetchFromSanity)` returns a `LoadRecommendations = () => Promise<Activity[]>`. Sanity entries first, then mocks filtered to exclude any slug already present in the Sanity response.
- `recommendations/sanity-source.ts` (new) — Stub `fetchActivitiesFromSanity` returning `[]`. This is the single integration point to swap in when the real Sanity client lands.
- `recommendations/source.test.ts` (new) — Three cases: empty Sanity → all mocks; non-overlapping Sanity → additive; same-slug Sanity → overrides mock.
- `recommendations/route.ts` — `GetRecommendationsDeps` now requires `loadRecommendations: LoadRecommendations`. Handler awaits the loader instead of importing `RECOMMENDATIONS` directly.
- `index.ts` — Constructs `loadRecommendations = createRecommendationLoader(fetchActivitiesFromSanity)` and passes it into `createApp`.
- `app.test.ts`, `onboarding/route.test.ts` — Inject a no-op `loadRecommendations: async () => []` since these tests don't exercise the recommendations route.
- `recommendations/route.test.ts` — Injects a `loadRecommendations` mock returning the full `RECOMMENDATIONS` fixture.

---

## 2026-05-21 — Refactor: Identify Activities by Slug

Replaces the `rec_NNN` numeric id with a human-readable slug derived from the activity title. Slugs scale beyond a 3-digit format, double as URL path segments for a future web app, and are more meaningful in logs/debugging. Mocks expose only `slug` (no separate `id`) so the data shape matches what Sanity will return.

**Types (`packages/types`)**

- `index.ts` — `Activity.id: string` → `Activity.slug: string`. No optional `id` retained; the resolved JSON contract from both mock and Sanity sources is slug-only.

**Mocks (`packages/mocks`)**

- `recommendations.ts` — All 152 entries renamed: `id: "rec_NNN"` → `slug: "<kebab-case-from-title>"`. Picsum URL seeds updated to match the new slugs. Slugs verified unique by a one-shot transformation script.

**Algorithm (`packages/core`)**

- `lib/helpers/diversify.ts` — `pickedIds` set renamed to `pickedSlugs`; all `.rec.id` references switched to `.rec.slug`. No behavioural change — the set is just keyed by a different string.
- `lib/helpers/diversify.test.ts` — Test fixture `makeRec(id, …)` signature renamed to `makeRec(slug, …)`. Synthetic fixture ids (`"top"`, `"bottom"`, `"music-best"`, etc.) already kebab-cased, so test bodies needed only the property rename.
- `lib/recommendation-algorithm.test.ts` — Membership-check assertion switched from `ids`/`rec.id` to `slugs`/`rec.slug`; inline `Activity` fixture updated.
- `recommendations/route.test.ts` — Shape assertion updated from `typeof rec.id` to `typeof rec.slug`.

**Mobile (`apps/mobile`)**

- `lib/recommendations/api.ts` — `getCachedActivity(id)` parameter renamed to `slug`; in-memory cache now keyed by `a.slug`.
- `app/(authed)/recommendations/index.tsx` — `FlatList` `keyExtractor` uses `rec.slug`; press handler pushes `/recommendations/detail?slug=${rec.slug}`.
- `app/(authed)/recommendations/detail.tsx` — Reads `?slug=` via `useLocalSearchParams`; passes it through to `getCachedActivity` and `fetchRecommendationDetail`.
- `components/recommendations/recommendations-index-page.stories.tsx` — `keyExtractor` updated to use `item.slug`.
- `__tests__/recommendations-index.test.tsx`, `__tests__/recommendations-detail.test.tsx` — Test assertions and mock params updated for the slug param.

**Docs (`context`)**

- `project-overview.md` — Example activity JSON shows `"slug": "build-a-guitar-pedalboard"` instead of `"id": "rec_001"`.

---

## 2026-05-20 — Recommendation Detail Page

New mobile screen at `(authed)/recommendations/detail?id=<rec_id>` that renders an activity's title/image/metadata instantly from the dashboard cache, then async-loads a placeholder AI summary and description. Reuses the existing `RecommendationCard` as the hero via a new `size="large"` mode so the list card and detail header can't drift in styling.

**Mobile (`apps/mobile`)**

- `app/(authed)/recommendations/detail.tsx` (new) — Reads `?id=` via `useLocalSearchParams`, resolves the base `Activity` synchronously from `getCachedActivity(id)` (no spinner for title/image/metadata), and effects a `fetchRecommendationDetail(id)` call for the extended fields. Shows a small `ActivityIndicator` while extended data loads; on fetch rejection the extended section is hidden but the card and CTA remain. Back button calls `router.back()`; a "Start this activity" `PrimaryButton` is wired with a no-op handler.
- `app/(authed)/recommendations/index.tsx` — Renamed from `app/(authed)/recommendations.tsx` so the route group can hold both `index` and `detail`. Each card is wrapped in a `Pressable` that pushes `/recommendations/detail?id=${rec.id}`.
- `components/recommendations/recommendation-card.tsx` — Added `size?: "default" | "large"` prop. `large` switches the image container from a fixed `160` height to a 4:3 aspect ratio and bumps the title to `text-2xl font-bold`. The same component now serves both the dashboard list item and the detail hero so they can't drift visually.
- `lib/recommendations/api.ts` — Added an in-memory `activityCache: Map<string, Activity>` populated inside `fetchRecommendations`; exposed `getCachedActivity(id)` for the detail screen. Added `fetchRecommendationDetail(id)` stub returning a `Pick<ActivityDetail, "aiSummary" | "description">` with mock copy — single-line swap to call `GET /recommendations/:id/detail` when the route lands (commented-out real call kept inline as a TODO).

**Types (`packages/types`)**

- `index.ts` — Added `ActivityDetail = Activity & { aiSummary: string; description: string }` so the detail-fetch response shape lives next to the existing `Activity` type.

**Tests (`apps/mobile`)**

- `__tests__/recommendations-detail.test.tsx` (new) — 6 tests: missing id → not-found; unknown id (cache miss) → not-found; cached id with pending fetch → card visible + spinner; resolved fetch → AI summary + paragraphs rendered + spinner gone; rejected fetch → card + CTA remain, summary hidden; back button → `router.back()`.
- `__tests__/recommendations-index.test.tsx` (new) — 6 tests covering the loading spinner, list render, card-press navigation to `/recommendations/detail?id=...`, `ProfileNotFoundError` redirect to onboarding, generic-error retry path, and sign-out flow.
- `__tests__/recommendation-card.test.tsx` (new) — 5 tests: title/type/field render, optional estimated-time row presence/absence, `getActivityTypeIcon`/`getFieldIcon` lookup, and image-error fallback swap (drives `expo-image`'s `onError` via a `Pressable` mock).

**Stories (`apps/mobile`)**

- `components/recommendations/recommendation-detail-page.stories.tsx` (new) — Loaded / Loading / NotFound visual states for the detail screen.
- `components/recommendations/recommendations-index-page.stories.tsx` (new) — Loaded / Loading / Error visual states for the dashboard.

---

## 2026-05-19 — Fix: Preserve Primary Affinity When Secondary Affinities Exist

Reworked the base-score formula so a strong primary pattern match is no longer diluted by the presence of `related_types`.

**Algorithm (`packages/core`)**

- `recommendation-algorithm.ts` — `calculateRecommendationBaseScore` now returns `primaryAffinity + secondaryAffinity * 0.2` when secondary patterns exist (previously `primary * 0.7 + secondary * 0.3`). Primary affinity is treated as the anchor; secondary affinity contributes a bonus (capped at +0.2) rather than displacing 30% of the primary signal. The no-secondary-patterns path still returns `primaryAffinity` unchanged. Removed `PRIMARY_WEIGHT`; renamed `SECONDARY_WEIGHT` from `0.3` to `0.2`. Base scores now have an arithmetic ceiling of 1.2, which is fine because scores are only used relative to each other for ranking.

**Tests (`packages/core`)**

- `recommendation-algorithm.test.ts` — Updated five `calculateRecommendationBaseScore` test expectations to match the new formula: primary-only ceiling (1.0), weighted blend (0.96), arithmetic ceiling (1.2), pooled secondary (1.1), and the all-zero floor (0.0).

**Docs (`context`)**

- `recommendation-engine.md` — Updated the Step 3 base-score description to the new formula and rationale, and refreshed surrounding sections (helpers path, motivation boost, diversify-and-order) to reflect the current pipeline.

---

## 2026-05-19 — Test: getRecommendations Integration Coverage + Activity Pool Injection

Expanded `getRecommendations` integration tests and decoupled the algorithm from its hardcoded activity source.

**Tests (`packages/core`)**

- `recommendation-algorithm.test.ts` — Four new `getRecommendations` integration tests: output has no duplicate activity types (diversification wired through); Art interest surfaces at least one Art-field rec (concrete positive assertion replacing the weaker count-monotonicity check); high-Openness/Extraversion user with `explore_creative` motivation and no interests surfaces creative-type recs (first test to exercise the motivation parameter end-to-end through `getRecommendations`); Art interest + `explore_creative` motivation together surface an Art-field creative-type rec. `creativeMotivation` hoisted to module level so it is shared by the `scoreRecommendation` and `getRecommendations` test sections.

**Algorithm (`packages/core`)**

- `recommendation-algorithm.ts` — `getRecommendations` now accepts an explicit `activities: Activity[]` parameter instead of importing `RECOMMENDATIONS` directly. Removes the module-level dependency on `@touchgrass/mocks/recommendations`, making the algorithm a pure function of its inputs and allowing the call site to swap in a DB-fetched catalog when the real endpoint arrives.
- `recommendations/route.ts` — Imports `RECOMMENDATIONS` from `@touchgrass/mocks/recommendations` and passes it as the `activities` argument to `getRecommendations`.

---

## 2026-05-19 — Unit Tests: calculateRecommendationBaseScore & scoreRecommendation

Added unit tests for the two private scoring functions, now exported.

**Tests (`packages/core`)**

- `recommendation-algorithm.test.ts` — Unit tests for `calculateRecommendationBaseScore` (no related types, weighted blend, primary-only ceiling when secondary weights are missing, pooling across multiple related types, arithmetic floor/ceiling) and `scoreRecommendation` (score equals base score with no motivations, rec object identity, motivation boost applied, boost monotonicity).

**Algorithm (`packages/core`)**

- `recommendation-algorithm.ts` — Exported `calculateRecommendationBaseScore` and `scoreRecommendation` to make them testable.

---

## 2026-05-19 — Recommendation Engine: Interest-Aware Bucket Diversification

Replaced the post-diversification interest boost with a bucket-based, interest-first diversification pipeline. The top recommendation slots now aim for one rec per user interest before activity-type diversity kicks in.

**Algorithm (`packages/core`)**

- `helpers/diversify.ts` (new) — `classifyBucket` assigns each scored rec to Top (`score >= 0.6` + field in interests), Middle (`score >= 0.6` + off-interest, OR `0.4 <= score < 0.6` + in-interest with a sort-only `+0.1` boost), or Bottom. `diversifyAndOrder` runs two layered passes: Pass 1 picks the highest-`sortScore` Top-bucket rec for each user interest (no type uniqueness inside the pass, so two interest fields may share an activity type — Pass 2 still avoids duplicating those types). Pass 2 walks the remaining `sortScore >= 0.6` pool (leftover Top ∪ Middle high-score) and picks one rec per previously-unseen activity type. Pass 1 is a no-op with 0 interests. After picks, remaining recs are appended in Top → Middle → Bottom order, each bucket sorted by `sortScore` desc. The `+0.1` boost is sort-only; the persisted `score` is never mutated.
- `recommendation-algorithm.ts` — `getRecommendations` now calls `diversifyAndOrder(scored, interests).slice(0, MAX_RECOMMENDATIONS)` directly after scoring + motivation boost. Removed the old `getDiverseRecommendations` and `applyInterestBoost` helpers and the unused `MIN_PRIMARY_AFFINITY_FOR_STRONG_MATCH` (0.65) threshold — the new logic uses `TOP_BUCKET_MIN_SCORE = 0.6`.

**Types (`packages/types`)**

- `index.ts` — Moved `ScoredRecommendation` and `ScoredActivityType` out of `packages/core` into the shared types package.

**Tests (`packages/core`)**

- `helpers/diversify.test.ts` (new) — 14 synthetic-data unit tests around `diversifyAndOrder` covering bucket placement, Top/Middle/Bottom ordering, Middle weighting competition (boost wins / boost insufficient), score preservation, one-per-interest behavior with type collision (2 interests), interest-pass-plus-type-fill (1 interest), and the 0-interest activity-type-only path.
- `recommendation-algorithm.test.ts` — Trimmed to `getRecommendations` shape/integration tests plus the existing `getTopActivityTypes` tests; the diversification tests now live alongside `helpers/diversify.ts`.

---

## 2026-05-16 — Motivation Boost: Fix Dead Adjacent Branch

Reworked `calculateMotivationBoost`. The previous implementation early-returned on an exact pattern lookup; because `getUserPatternWeights` returns a complete `Record<PatternTypeId, number>`, that branch was always taken in production and the adjacent-pattern contribution was dead code. The new logic computes both contributions for every shared target.

**Algorithm (`packages/core`)**

- `helpers/motivation.ts` — For each shared target pattern `calculateMotivationBoost` now sums `userWeight × EXACT` plus each adjacent neighbour's `userWeight × {STRONG_ADJACENT | WEAK_ADJACENT}` — so below-threshold weights still contribute proportionally without an explicit dampening factor. Renamed `getMotivationPatterns` → `getMotivationAndActivitySharedPatterns` and expanded the surrounding doc comments.

**Tests (`packages/core`)**

- `helpers/motivation.test.ts` — Added coverage for the exact + adjacent summation case for a single target; renamed import to match the renamed helper.

---

## 2026-05-15 — Recommendation Engine: Motivation Boost, Interest Boost & Diversification

Three new scoring stages added to the recommendation pipeline, along with a fix to OCEAN score derivation.

**Algorithm (`packages/core`)**

- `recommendation-algorithm.ts` — Diversification step (`getDiverseRecommendations`) ensures no two results share the same primary `ActivityType` (added 2026-05-11). Motivation boost applied before diversification: each recommendation's pattern-affinity score is multiplied by a boost factor derived from the user's selected motivations — EXACT match (1.0), STRONG_ADJACENT (0.65), or WEAK_ADJACENT (0.5) based on NEO pattern adjacency (shared `groupId` + polarity distance). Interest boost applied after diversification: candidates whose `ActivityType` matches any of the user's interest fields are sorted to the front before the final `MAX_RECOMMENDATIONS` slice.
- `helpers/` — Split the single `helpers.ts` into `ocean.ts`, `patterns.ts`, and `motivation.ts` (re-exported from `helpers/index.ts`). `getOCEANScores` fixed to derive each OCEAN trait from its true BFAS parent aspects. `motivation.ts` exposes `calculateMotivationBoost`, which computes per-recommendation boost weights.
- `recommendations/route.ts` — Passes `motivations` and `interests` from the user profile through to `getRecommendations`; `interests` is narrowed against `ACTIVITY_FIELDS` before passing.

**Validation (`packages/core`)**

- `onboarding/schema.ts` — Motivations array now requires `.min(1)`; the backend rejects submissions with no motivation selected.

**Types (`packages/types`)**

- `Motivation` type moved from `packages/core` into `packages/types` for shared access.

---

## 2026-05-10 — NEO Pattern Recommendation Scoring

Replaced the per-trait OCEAN alignment scoring in the recommendation engine with a NEO pattern-strength model that scores each activity against the user's fit across the 40 IPIP-NEO pattern types (10 OCEAN trait pairs × HH/HL/LH/LL combinations).

**Types (`packages/types`)**

- `index.ts` — Added `OCEANScores`, `TraitLevel`, `PatternTypeId` (40-id union), `PatternGroup`, `PatternType`. Added optional `patternTypes?: PatternTypeId[]` field on `Recommendation` for human-curated overrides (declared, not yet read by the algorithm).
- `constants.ts` — Removed the old `ACTIVITY_TYPE_BFAS_MAPPING`. Added `patternGroups` (10 trait-pair groups), `patternTypes` (40 named patterns with H/L definitions), and `ActivityTypePatterns` (each `ActivityType` → 3 pattern IDs that best express it).

**Server (`packages/core`)**

- `lib/helpers.ts` (new) — `getOCEANScores` collapses BFAS aspects into their parent OCEAN traits by averaging. `calculatePatternStrength` scores how well a user's OCEAN scores fit a pattern's H/L spec (each trait → `score/100` for H or `1 - score/100` for L, then averaged). `getUserPatternStrengths` runs that across all 40 patterns. `calculateActivityPatternAffinity` averages the user's strengths across a list of pattern IDs (returns 0 for empty input).
- `lib/recommendation-algorithm.ts` — Rewrote `getRecommendations`. Now: BFAS → OCEAN → pattern strengths; for each recommendation, primary affinity (over `ActivityTypePatterns[type]`) and secondary affinity (over the union of patterns from `related_types`). Final score is `0.7 * primary + 0.3 * secondary`, falling back to primary alone when `related_types` is absent (so an empty secondary list doesn't drag the score toward zero). Sorts highest → lowest, returns top 3.
- `lib/helpers.test.ts` (new) — 8 unit tests covering `getOCEANScores` averaging, `calculatePatternStrength` H/L matching including 0/100 boundaries, and `calculateActivityPatternAffinity` (empty list, multi-pattern average, missing-key handling).

**Mocks (`packages/mocks`)**

- `recommendations.ts` — `rec_072` (TikTok choreography) retyped from `Creative` to `Performative` and its `related_types` updated to remove the duplicate that previously had its own `type` listed as a related type.

**Docs (`context`)**

- `recommendation-engine.md` — Added BFAS aspect breakdown, full IPIP-NEO pattern group catalog, and a four-stage Algorithm Flow section (BFAS→OCEAN, pattern strengths, primary/secondary scoring with the 0.7/0.3 split, sort & return top 3) with notes on inputs not yet wired in (motivation, interests, curated `patternTypes`).

## 2026-05-08 — Frontend Code Audit Fixes

Issues surfaced by a frontend audit: null-safety, broken image fallback, missing accessibility, ScrollView on dynamic list, silent profile-creation errors, localhost env-var leak, sign-out race, and image layout shift.

**Mobile (`apps/mobile`)**

- `lib/recommendations/api.ts` — `body.recommendations ?? []` guards against a malformed API response where the key is absent, preventing a runtime crash on `.map()`.
- `components/recommendations/recommendation-card.tsx` — Added `onError` handler to `expo-image`; broken or missing image URLs now render an emerald placeholder `View` instead of a broken slot. Image `height` changed from `"100%"` to the explicit `160` to prevent layout shift on load.
- `components/ui/primary-button.tsx` — `Pressable` now carries `accessibilityRole="button"` and `accessibilityLabel={label}`.
- `components/ui/chip.tsx` — `Pressable` now carries `accessibilityRole="togglebutton"`, `accessibilityLabel`, and `accessibilityState={{ selected }}`.
- `components/ui/option-card.tsx` — `Pressable` now carries `accessibilityRole="radio"`, `accessibilityLabel`, and `accessibilityState={{ checked: selected }}`.
- `app/(authed)/recommendations.tsx` — Replaced `ScrollView` + `.map()` with `FlatList` (`keyExtractor`, stable `renderItem` via `useCallback`, `ItemSeparatorComponent`, `ListHeaderComponent`, `ListFooterComponent`, `initialNumToRender={5}`). Added `signingOut` state — both sign-out buttons disable and show "Signing out..." while the request is in flight; both carry `accessibilityRole="button"` and `accessibilityLabel="Sign out"`.
- `components/onboarding/loading-screen.tsx` / `app/onboarding/loading.tsx` — Profile creation errors are now classified (network `TypeError` vs server error) and a specific message is passed down to `OnboardingLoadingView` instead of the generic fallback.
- `lib/auth/client.ts`, `lib/onboarding/api.ts`, `lib/recommendations/api.ts` — `EXPO_PUBLIC_API_BASE_URL` fallback to `localhost:3000` is now gated on `__DEV__`; production builds throw immediately if the variable is unset.

## 2026-05-08 — Backend Security & Validation Fixes

Five issues surfaced by a backend audit: CORS wildcard, missing env guard, unvalidated jsonb, duplicate-profile 500, and raw Zod errors in responses.

**Server (`packages/core`)**

- CORS `origin: true` replaced with an explicit `trustedOrigins` allowlist. The same array is now shared between `cors` middleware and `betterAuth` via a named export from `auth.ts`, so the two can't diverge.
- Added a startup guard for `BETTER_AUTH_URL` — the server now throws on boot if the variable is unset, matching the existing guard for `BETTER_AUTH_SECRET`.
- `personality` jsonb is now parsed with `bfasScoresSchema` at runtime after the DB fetch, before being passed to the recommendation algorithm. Previously the ORM's compile-time `.$type<T>()` cast provided no runtime protection; malformed rows silently produced wrong scores.
- `POST /profiles` now pre-checks for an existing profile and returns 409 instead of letting the DB unique constraint surface as a 500. A second 409 path in the catch block handles the `23505` race condition for simultaneous requests.
- Zod validation errors on `POST /profiles` are now mapped to `{ path, message }` pairs before being sent — internal fields (`code`, `expected`, `origin`) are stripped from the response.
- Added `app.test.ts` with four CORS tests (trusted/untrusted origin, simple and preflight). Added tests for malformed `personality` (500), duplicate profile (409), race-condition `23505` (409), and sanitized 400 error shape.

## 2026-05-08 — Authed Route Group & Sign-In Race Fix

Locks down `/recommendations` so signed-out users can only ever see the onboarding flow, and fixes a race that bounced freshly-signed-in users back to onboarding instead of into the app.

**Mobile (`apps/mobile`)**

- New `app/(authed)/` route group with a `_layout.tsx` that reads `useSession()` and `<Redirect>`s to `/onboarding/name` when there is no session, renders an `ActivityIndicator` while pending, and otherwise renders a `Stack`. Moved `app/recommendations.tsx` into the group (URL is unchanged because parens-prefixed groups don't appear in the path). Future authed routes drop into the group to inherit the gate.
- `app/sign-in.tsx` now awaits `useSession().refetch()` after a successful `signIn.email()` before navigating. Without this, `router.replace("/recommendations")` could fire before Better Auth's `$sessionSignal`-triggered refetch had updated the session atom, so the new `(authed)` gate read a stale `{data: null}` on first render and bounced the user back to `/onboarding/name`.
- Added Jest setup (`jest-expo` preset, `@testing-library/react-native`, `react-test-renderer`, `@types/jest`) plus a `test` script and Jest config in `apps/mobile/package.json`. First integration test (`__tests__/authed-layout.test.tsx`) covers the gate's three states: pending, signed-out → redirect, signed-in → render `Stack`.

## 2026-05-08 — Better Auth (Email + Password)

Added Better Auth as the auth layer. Sign-up / sign-in / sign-out, persisted sessions, and a session-driven API.

**Server (`packages/core`)**

- `better-auth` configured with the Drizzle adapter against the existing Neon DB; email/password enabled (8-char minimum). Handler mounted at `/api/auth/{*splat}` on the Express app, before `express.json()`. CORS now permits credentials.
- New `getSessionUserId(req)` helper reads the Better Auth session via `auth.api.getSession`. Injected as a dep into route handlers so tests can mock it.
- `users` table replaced by `profiles`, with a new `auth_user_id` (text, NOT NULL, UNIQUE, FK to `user(id)` ON DELETE CASCADE) one-to-one with the auth user.
- Session-driven endpoints: `POST /profiles` requires a session and stamps `authUserId` from it; `GET /recommendations` requires a session and looks up the profile by `authUserId`. 401 unauthenticated, 404 if signed in but no profile yet.
- Single `0001_better_auth_and_profiles.sql` migration creates the four Better Auth tables (`user`, `session`, `account`, `verification`), renames `users` → `profiles`, and adds the `auth_user_id` column with its FK and unique constraint.
- `npm test` now loads `--env-file=../../.env.local` because `app.ts` transitively imports `db/client.ts` (via auth) at module load.

**Mobile (`apps/mobile`)**

- Installed `better-auth`, `@better-auth/expo`, `expo-secure-store`, and `expo-network`.
- `lib/auth/client.ts` — Better Auth client. On native, uses `expoClient` plugin with `expo-secure-store` for token persistence. On web, skips the plugin and relies on `credentials: "include"` so the browser handles cookies natively.
- `lib/auth/fetch.ts` — `authedFetch` helper that attaches the session cookie via `authClient.getCookie()` on native and uses `credentials: "include"` on web. Used by both API helpers.
- Onboarding name screen extended with email, password, and confirm-password fields. Email-format / password-length / passwords-match validation. `signUp.email()` wrapped in try/catch — server errors surfaced inline ("User already exists. Use another email."), transport errors caught with a generic "Couldn't reach the server" message. Added a "Sign in" link for returning users.
- New `app/sign-in.tsx` for returning users — same try/catch pattern around `signIn.email()`, links back to account creation.
- `app/index.tsx` reads `useSession()` and routes signed-in users to `/recommendations`, everyone else to `/onboarding/name`, with a spinner during the initial session check.
- "Sign out" button on `/recommendations` (both ready and error states) routes back through `/`.

## 2026-05-04 — Move Shared Types Into `@touchgrass/types`

- Moved `apps/mobile/lib/types.ts` into `packages/types/index.ts` so the activity, field, and Big Five personality types are now shared workspace exports rather than mobile-private. The previously empty `packages/types/` stub now has real contents.
- Updated `packages/types/package.json` to expose `index.ts` directly via `main` and `types` (no build step — Metro and TypeScript resolve the source file).
- Added `@touchgrass/types: "*"` as a dependency of `@touchgrass/mobile`; npm linked it as a workspace symlink under `node_modules/@touchgrass/types`.
- Switched all five import sites in the mobile app from `@/lib/types` to `@touchgrass/types`: `app/onboarding/interests.tsx`, `app/onboarding/personality.tsx`, `lib/onboarding-context.tsx`, `lib/icons.ts`, `lib/recommendations.ts`. Lint and `tsc --noEmit` both pass.

## 2026-05-04 — Monorepo Restructure

- Converted the repo to an npm-workspace monorepo with `apps/*` and `packages/*`. The Expo project now lives at `apps/mobile/` (renamed to `@touchgrass/mobile`); `apps/web/`, `packages/core/`, and `packages/types/` are stub workspaces (each contains only a minimal `package.json`) reserved for the future web app, microservice, and shared schemas.
- Root `package.json` is now a workspace manifest with no dependencies; it exposes proxy scripts (`start`, `ios`, `android`, `web`, `lint`, `storybook[:ios|:android|:web]`) that delegate to `@touchgrass/mobile`, so the same dev commands keep working from the repo root.
- Updated `apps/mobile/metro.config.js` for monorepo support: `watchFolders` covers the workspace root and `resolver.nodeModulesPaths` resolves both the project's and the hoisted root `node_modules`. Hierarchical lookup is left enabled so Metro can find nested deps like `react-native-reanimated`'s private `semver@7`.
- Updated `.gitignore` so the storybook auto-generated file and Expo's native-folder patterns still match under the new layout (`**/.storybook/storybook.requires.ts`, `**/ios`, `**/android`).
- All source files were moved with `git mv` so history is preserved as renames; no app code was modified.

## 2026-05-03 — Storybook for React Native

- Installed `@storybook/react-native` v10 with on-device addons (controls, actions, backgrounds, notes) and `@react-native-async-storage/async-storage` for state persistence.
- Added `.storybook/` config (`main.ts`, `preview.tsx`, `index.ts`); preview decorator wraps stories with `SafeAreaProvider` and imports `global.css` so NativeWind classes apply.
- Wrapped Metro with `withStorybook`, gated by `EXPO_PUBLIC_STORYBOOK=true`. Added a custom `index.js` entry that swaps between `expo-router/entry` (default) and the Storybook UI based on the same env flag.
- Added `npm run storybook[:ios|:android|:web]` scripts and a `storybook-env.d.ts` triple-slash reference for `require.context` types.
- Authored stories for every existing component: `GrassLogo`, `OnboardingProgress`, `OnboardingScreenShell`, `SkipButton`, `RecommendationCard`, `Chip`/`ChipGroup`, `FieldRow`, `OptionCard`, `PrimaryButton`, `Slider`, `TextField`.
- Gitignored the auto-generated `.storybook/storybook.requires.ts`.

## 2026-04-30 — Onboarding Phase 2 - Form Submission

- Migrated the onboarding flow to React Hook Form: `OnboardingProvider` now wraps a `FormProvider`, and each screen consumes the form via a `useOnboardingForm()` hook (`useFormContext`).
- Wired up validation across screens: name (Screen 1), birthdate / height / gender / build / location / employment (Screen 2), all five Big Five scores (Screen 4), and ≥1 motivation (Screen 5). Screen 3 (Interests) remains optional.
- Added `app/onboarding/loading.tsx` — a post-submission loading screen with a spinner, the message "Let's see what your next thing could be!", and a 2 s delay (in lieu of the recommendation algorithm) before redirecting to the recommendations view.
- Added `react-hook-form` as a dependency.

## 2026-04-30 — Recommendations Config

- Extracted recommendation mock data out of `app/recommendations.tsx` into a typed config at `lib/recommendations.ts`, exporting a `Recommendation` type and a `RECOMMENDATIONS` array.
- Expanded the mock dataset to 100 entries spanning all 10 activity types and all 20 fields, covering 100 unique type/field combinations with varied estimated times.
- Added an optional `related_types?: ActivityType[]` field to the `Recommendation` type, initialised to an empty array on every entry.

## 2026-04-26 — Recommendation Card Icons

- Added a coherent icon lookup system (`lib/icons.ts`) that maps each recommendation `type` (Constructive, Active, Artistic, Intellectual, Outdoorsy, Social, Reflective, Creative, Adventurous, Professional) and `field` (Music, Martial Arts, Literature, Cooking, Photography, Gaming, Fitness, Coding, Science, Nature, Film, Theater, Visual Art, Writing, Dance, Cycling, Hiking, Travel, Wellness, Astronomy) to a meaningful lucide icon, with fallbacks for unknown labels.
- Updated `RecommendationCard` to render the looked-up icons for `type` and `field`.
- Added optional `estimatedTime` prop to `RecommendationCard`, always rendered with a clock icon.
