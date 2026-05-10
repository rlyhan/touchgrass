# Changelog

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
