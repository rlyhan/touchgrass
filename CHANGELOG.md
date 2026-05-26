# Changelog

## [1.2.1] - 2026-05-26 — Fix: Web auth broken by third-party cookie blocking

Browsers block cookies set by `touchgrass-api.fly.dev` when the page is served from `touchgrass-mobile.vercel.app` (third-party cookie restriction), so cookie-based session tracking failed on web. Replaced it with bearer token auth: the server now accepts `Authorization: Bearer <token>` headers via better-auth's `bearer` plugin, and the web client stores the session token in `localStorage` and attaches it on every request. Native (Expo) flow is unchanged and continues to use the existing ExpoClient + SecureStore cookie storage.

### API (`packages/core`)

- Enabled better-auth's `bearer` plugin in `src/auth.ts` so `auth.api.getSession()` (used by `auth-session.ts` and the `/api/auth/*` handler) accepts session tokens from the `Authorization: Bearer` header in addition to cookies.

### Mobile (`apps/mobile`)

- Added `lib/auth/token-store.ts` — SSR-safe `localStorage` helpers (`getStoredToken`, `setStoredToken`, `clearStoredToken`) for web bearer token persistence.
- Updated `lib/auth/client.ts` — `signIn.email` and `signUp.email` are wrapped on web to store the token synchronously before callers make subsequent requests (e.g. `refetch()`). The `onRequest` hook attaches `Authorization: Bearer` on every auth-client request; `onSuccess` clears the token on sign-out; `onError` clears it on 401. Native flow (ExpoClient + SecureStore) is unchanged.
- Updated `lib/auth/fetch.ts` — `authedFetch` on web now reads the stored token and attaches `Authorization: Bearer` so non-auth API calls (`/profiles`, `/recommendations`, etc.) are also authenticated.

## [1.2.0] - 2026-05-26 — Chore: Fly.io QA environment and direct API routing

Introduces a Fly.io QA environment and removes the Vercel proxy layer so all clients call the API directly via `EXPO_PUBLIC_API_BASE_URL`. This enables QA and prod Vercel deployments to target independent APIs without sharing a `vercel.json` rewrite destination.

### Infra (`fly.toml`)

- Added Fly.io configuration for the `touchgrass-api-qa` app (`sjc` region, `shared-cpu-1x`, 256 MB). Machine suspension (`auto_stop_machines = "suspend"`) is used in place of full shutdown, giving ~1–3 s resume latency vs ~4 s cold boot and ~32 s on Render free tier.
- `min_machines_running = 0` keeps the QA environment free when idle.

### Mobile (`apps/mobile`)

- Removed proxy-based URL resolution for web prod builds. `resolveBaseUrl()` now resolves `EXPO_PUBLIC_API_BASE_URL` first on all platforms; the `window.location.origin` fallback and `/_api` path prefix (which depended on Vercel rewrites) are removed.
- `EXPO_PUBLIC_API_BASE_URL` is now required in all non-dev builds, including web.

### Infra (`vercel.json`)

- Removed `/api` and `/_api` proxy rewrites. Each Vercel project (QA, prod) sets its own `EXPO_PUBLIC_API_BASE_URL` env var to point directly at the appropriate Fly API.

## [1.1.3] - 2026-05-26 — Chore: Prebuild API to reduce Render cold-start time

The production API now ships as a single esbuild-bundled JS file instead of being transpiled by `tsx` at boot, cutting application-level startup cost. Render's build step also skips the mobile, sanity, and web workspaces entirely.

### Backend (`packages/core`)

- Added `build` script driven by `esbuild.config.mjs` — bundles `src/index.ts` into `dist/index.js`, inlining `@touchgrass/types` and `@touchgrass/mocks` and externalizing `node_modules` deps. `start` now runs `node dist/index.js` directly; `dev` continues to use `tsx watch`, so the local workflow is unchanged.

### Infra (`render.yaml`)

- Narrowed `buildCommand`'s `npm install` to only the workspaces the API needs (`@touchgrass/core`, `@touchgrass/types`, `@touchgrass/mocks`) — `apps/mobile`, `apps/sanity`, and `apps/web` are excluded, cutting install time and image footprint.
- `buildCommand` now also runs `npm run build --workspace=@touchgrass/core` to produce the bundle before `start`.

## [1.1.2] - 2026-05-25 — Fix: Recommendations fail on Expo Go (physical device)

### Mobile (`apps/mobile`)

- Fixed "Couldn't load your recommendations" error when running on a physical device via Expo Go. The API base URL was hardcoded to `http://localhost:3000` in dev mode, which resolves to the device itself rather than the dev machine. The URL is now derived from `Constants.expoGoConfig.debuggerHost` so the correct LAN IP is used on real devices; the simulator is unaffected (continues to resolve via `127.0.0.1`).

## [1.1.1] - 2026-05-25 — Feat: Update UI messaging

Improved messaging on dashboard and activity patterns for coherence.

### Mobile (`apps/mobile`)

- 'You could be great at...' messaging changed to 'Your recommendations'.

### Shared types (`packages/types`)

- Pattern type short descriptions improved to more positive framing.

## [1.1.0] - 2026-05-25 — Feat: Surface Pattern Alignments In Mobile App

Surfaces each user's NEO pattern type alignments in the mobile app so users (especially those who skipped interests) can see the personality-based rationale for their matches. The recommendations dashboard now shows the top three matching patterns as animated rings; the activity detail screen explains the per-activity match via a collapsible accordion.

### Shared types (`packages/types`)

- Added `dominant-pattern.ts` exporting `getDominantPatternId` and the `MIN_DOMINANT_WEIGHT = 0.6` threshold via a new `@touchgrass/types/dominant-pattern` subpath. Resolves the pattern with the highest user weight from an activity's primary + `related_types` patterns, returns `null` when no candidate meets the threshold so the "you scored highly" copy isn't shown for weak matches. Lives in `packages/types` so backend and mobile share one implementation.
- Added response DTOs `RecommendedActivity`, `RecommendationsResponse`, `PatternWeightsResponse`, and `UserPatternWeights`.

### Backend (`packages/core`)

- `GET /recommendations` now returns `patternWeights: Record<PatternTypeId, number>` plus `dominantPatternId` on each recommendation, computed via the shared helper.
- Added `GET /pattern-weights` — a lightweight endpoint that returns only the user's pattern weights, used by activity-detail cold-loads (deep links, refresh) to avoid refetching the full recommendations list when populating the accordion.
- Unit tests for dominant-pattern resolution (primary + related, dedup, tie-break, threshold gating) plus endpoint tests for `/pattern-weights`.

### Mobile (`apps/mobile`)

- Added a top-patterns section above the recommendations list — three animated circular progress rings (`react-native-svg` + `react-native-reanimated`) showing the user's top three patterns by weight with their percentage. Tapping a ring expands an inline grey detail box with the pattern's name and short description; the previously-tapped ring fades to a paler emerald while non-selected rings dim, and a second tap (or selecting another ring) cross-fades back.
- Added a pattern-match accordion on the activity detail screen. Default copy: "You were matched because you scored highly as a {patternName}." with a "See more" affordance; expanding reveals the pattern's short description. Hidden entirely when no pattern meets the 0.6 threshold for that activity, so the rationale never overclaims.
- Pattern weights are sourced from a module-level cache shared across screens. Recommendations populates the cache on dashboard load; activity-detail reads from the cache for instant resolution, or refetches via `/pattern-weights` on cold deep-links. The cache is cleared on sign-out so the next user doesn't inherit prior weights.
- Metro resolver now strips `.js` extensions on relative imports for workspace TS packages so `@touchgrass/types/dominant-pattern.js` (NodeNext-style) resolves under Metro, which doesn't rewrite extensions the way `tsx` does.

## [1.0.7] - 2026-05-25 — Chore: Keep-Warm Cron For Render Free Tier

The Render API spins down after ~15 minutes of inactivity on the free plan, causing 30–60 second cold starts that manifested as an indefinite loading spinner on first visit (`useSession` waiting on `/api/auth/get-session`).

### Infra (`.github/workflows`)

- Added `keep-warm.yml` — a GitHub Actions cron that pings `https://touchgrass-api-81dp.onrender.com/health` every 10 minutes via `workflow_dispatch` and `schedule`. GitHub's scheduler is best-effort and frequently delayed 5–15 minutes under load, so 10 min cadence gives margin against Render's 15 min idle window. When the project graduates to a paid Render tier this workflow can be deleted.

## [1.0.6] - 2026-05-24 — Fix: iPhone Safari Sign-In Redirecting to Onboarding

After successful sign-in on iPhone Safari, the authed layout saw a null session and redirected back to onboarding. Safari's Intelligent Tracking Prevention blocks the better-auth session cookie because the web client (`touchgrass-mobile.vercel.app`) and the API (`touchgrass-api-81dp.onrender.com`) are on different registrable domains, making the cookie cross-site. Desktop browsers were permissive enough to accept the `SameSite=None; Secure` cookie, masking the bug.

The web client now talks only to the Vercel domain; Vercel proxies everything to Render server-side. Cookies are scoped to `touchgrass-mobile.vercel.app` and treated as first-party by Safari. Render still hosts the backend unchanged.

### Infra (`vercel.json`)

- Added two Vercel rewrites that transparently proxy to Render: `/api/:path*` (used by better-auth's client, which always appends `/api/auth/*` to its baseURL) and `/_api/:path*` for the bespoke routes (`/profiles`, `/recommendations`, `/activities/:slug`). The split exists because `app.json` sets `"web": { "output": "static" }`: Expo Router emits a static HTML file per route, Vercel checks the filesystem before rewrites, and bare paths like `/recommendations` would otherwise be served as HTML. `/api/*` and `/_api/*` collide with no Expo route so the rewrites always fire.

### Mobile (`apps/mobile`)

- `lib/config.ts` now resolves `API_BASE_URL` from `window.location.origin` at runtime on web (production) instead of `EXPO_PUBLIC_API_BASE_URL`. This sidesteps a Vercel-specific footgun where dashboard env vars silently override `.env.production` — Expo's dotenv won't replace values already present in `process.env`. Native and local dev continue to read the env var (EAS injects from `eas.json`; dev falls back to `localhost:3000`).
- Added an `apiUrl(path)` helper in `lib/config.ts` that prepends `/_api` on web prod so non-auth fetches hit the proxy prefix that avoids Expo's static-export collision. Native and dev hit the backend directly with no prefix. `lib/onboarding/api.ts` and `lib/recommendations/api.ts` now route through `apiUrl()`; the auth client keeps using `API_BASE_URL` bare so better-auth's `withPath` correctly appends `/api/auth` (it skips appending when the baseURL already has a path, which is why earlier attempts at a `/_api` baseURL routed auth calls to non-existent endpoints on Render).

## [1.0.5] - 2026-05-24 — Fix: Sanity-Only Activities Returning 404

Sanity-only activities (no corresponding mock entry) were silently dropped during source validation, causing any request to `/activities/:slug` for those items to return 404. The fix makes optional array fields in `activitySchema` tolerant of `null` values returned by Sanity.

### Backend (`packages/core`)

- Fixed `activitySchema` to accept `null` for optional array fields (`tips`, `instructions`, `related_types`, `description`) by using `.nullish().transform(v => v ?? undefined)` instead of `.optional()`. Sanity returns `null` for unset document fields; Zod's `.optional()` rejects `null`, causing documents like `shoot-a-60-second-short-film` to fail validation and be excluded from the activity list.
- Added a regression test covering the case where a Sanity-only activity has `null` optional fields, asserting it is included in the result with those fields resolved to `undefined`.

## [1.0.4] - 2026-05-24 — Chore: Expand Mock Recommendation Data as Sanity Fallback

Mock data expanded to include `description`, `instructions`, and new Unsplash image URLs in order to have sufficient coverage for recommendations across users as fallback while Sanity CMS data catches up.

### Shared (`packages/mocks`)

- Added a `pt(...paragraphs)` helper that wraps plain strings into the `PortableTextBlock[]` shape `Activity.description` expects, so future mock descriptions stay one-liners instead of hand-written Sanity block JSON.
- Populated `description` and `instructions` for every activity in `RECOMMENDATIONS`, giving each category enough content to render the activity detail screen end-to-end without Sanity.

### Backend (`packages/core`)

- Added tests for the `pt` helper and updated an existing source test whose assertion was tied to the now-removed assumption that mocks had no `instructions`.

## [1.0.3] - 2026-05-24 — Fix: Scope Mobile Production API URL to Production Builds

`apps/mobile/.env` was unconditionally loaded by Expo across every environment, so the Render production URL it defined overrode the `__DEV__` fallback in `lib/config.ts` even during local dev. The Vercel web build (`expo export`) and EAS native builds need the production URL, but `expo start` should resolve to the local API. Conflating "production build config" with "always-loaded config" masked local backend changes — most recently the 1.0.2 trusted-origins fix had no effect on dev sign-in because requests were still being routed at Render.

### Mobile (`apps/mobile`)

- Renamed `apps/mobile/.env` to `apps/mobile/.env.production`. Expo's dotenv loader only reads `.env.production` when `NODE_ENV=production`, which is the case during `expo export` (Vercel) but not during `expo start` (local dev). Local dev now correctly falls back to `http://localhost:3000` via `lib/config.ts`, while Vercel web builds continue to receive the Render URL. EAS native builds are unaffected — they inject the URL via the `env` block in `eas.json`. Note: `EXPO_PUBLIC_*` values are inlined at bundle time, so Metro must be restarted with `--clear` after the file change for the new resolution to take effect locally.

## [1.0.2] - 2026-05-24 — Fix: Invalid Origin Error When Signing In From Expo Go

Sign-in from Expo Go on the iOS simulator returned `INVALID_ORIGIN` from better-auth. The `@better-auth/expo` client sets the request origin to `Linking.createURL("", { scheme })`, which resolves to an `exp://…` URL inside Expo Go (only resolving to `touchgrass://` in dev/standalone builds). The expo plugin's built-in `exp://` allowlist is gated on `NODE_ENV === "development"`, which our `tsx watch` dev script does not set — so the scheme was never trusted in local development.

### Backend (`packages/core`)

- Added `exp://` to `DEV_TRUSTED_ORIGINS` in `trusted-origins.ts` so Expo Go's origin header is accepted in local development independent of `NODE_ENV`. `matchesOriginPattern` falls back to `startsWith` for non-http(s) schemes, so the prefix covers every `exp://host:port/...` variant.
- Updated `trusted-origins.test.ts` to assert the new entry.

## [1.0.1] - 2026-05-24 — Fix: Back Button Missing During Onboarding

`OnboardingScreenShell` had no back button; steps 2–5 were forward-only. On iOS, cold-starting into a mid-onboarding screen with an empty history stack would crash with an unhandled `GO_BACK` action.

### Mobile (`apps/mobile`)

- Added a `backHref` prop to `OnboardingScreenShell`; renders a `ChevronLeft` back button when `step > 1`, keeping the logo centred via absolute positioning.
- Back navigation calls `router.back()` when a history stack exists and falls back to `router.replace(backHref)` on cold start, eliminating the `GO_BACK` crash.
- Wired `backHref` on all four non-first onboarding screens: `basic-details`, `interests`, `personality`, and `motivation`.

## [1.0.0] - 2026-05-24 — Fix: RecommendationCard Shadow Missing on Web

The card shadow was applied with `Platform.select`, whose `default` branch (web) returned an empty object. On desktop browsers the cards rendered flat with no depth.

### Mobile (`apps/mobile`)

- Populated the `default` branch of `Platform.select` in `RecommendationCard` with a CSS `boxShadow` property (`0px 4px 8px rgba(0,0,0,0.12)`), which React Native Web applies as a native CSS box shadow. iOS and Android shadow behaviour is unchanged.

## 2026-05-24 — Fix: Correct API Base URL in EAS Build Profiles

The `preview` and `production` build profiles in `eas.json` pointed at `https://touchgrass-api.onrender.com`, but the actual deployed API is `https://touchgrass-api-81dp.onrender.com`. Internal distribution builds would have hit a dead host.

### Mobile (`apps/mobile`)

- Updated `EXPO_PUBLIC_API_BASE_URL` in the `preview` and `production` profiles of `eas.json` to the correct Render hostname.

## 2026-05-24 — Fix: Constrain Web App to Mobile Width on Desktop

The Vercel-hosted web build rendered full-width on desktop, making it look unstyled. A CSS media query now restricts the layout to a centred 430 px column on viewports ≥ 768 px wide.

### Mobile (`apps/mobile`)

- Added a desktop media query to `global.css` that centres the layout at `max-width: 430px` on viewports ≥ 768 px; mobile viewports are unaffected.

## 2026-05-24 — Refactor: Centralise Inline Hex Colours into a Theme Module

Hardcoded hex strings passed as JS props were duplicated across up to six files. A single typed `colors` module now serves as the source of truth for all non-className colour values.

### Mobile (`apps/mobile`)

- Added `lib/theme/colors.ts` exporting a typed `colors` object with Tip palette, Tailwind-aligned shade scales, and standalone white/black entries.
- Migrated 12 consumer files to reference named colour keys instead of raw hex literals.

## 2026-05-24 — Fix: Post-Deploy UI Polish

Visual cleanup pass on issues observed on real devices — spinner/logo contrast, missing iOS card shadows, and loose spacing and typography across the dashboard and activity detail screens.

### Mobile (`apps/mobile`)

- Changed loading spinner colour from emerald-500 to warm tan (`#E0AE85`) so it reads distinctly against the green logo.
- Restored `RecommendationCard` iOS shadow by separating the shadow wrapper from the `overflow: hidden` content view; added explicit shadow props for both platforms.
- Rebalanced recommendations dashboard spacing and restyled the "Sign out" link as a bordered pill.
- Increased activity detail section heading sizes, instruction title sizes, step badge dimensions, and inter-section spacing.

## 2026-05-23 — Fix: Blank Screen in Expo Go After `eas update`

Every `eas update` build loaded as a blank white screen in Expo Go due to a stale Metro cache bundling `lib/config.ts` before `EXPO_PUBLIC_API_BASE_URL` was set. With no error boundary in place the crash was silent.

### Mobile (`apps/mobile`)

- Added an `ErrorBoundary` export to `_layout.tsx` so Expo Router surfaces crashes in production instead of showing a blank screen.
- Added `apps/mobile/.env` with `EXPO_PUBLIC_API_BASE_URL` so the value is reliably inlined after a Metro cache clear.
- Disabled the `reactCompiler` experiment in `app.json` to avoid Hermes bytecode incompatibilities with Expo Go.
- Run `eas update --clear-cache` (or delete `apps/mobile/.expo/`) whenever env-var-dependent code changes.

## 2026-05-23 — Refactor: Toggle Utility and Async Data Hook

Extracted two shared utilities to eliminate duplicated array-toggle and async-fetch patterns in the onboarding and recommendations screens.

### Mobile (`apps/mobile`)

- Extracted a `toggleItem<T>` utility replacing duplicated include/filter array logic across onboarding screens.
- Extracted a `useAsyncData<T>` hook replacing manual status/data/useEffect fetch state management in the recommendations screen.

## 2026-05-22 — Fix: Accessibility and Display Polish

Corrected accessibility role misreports and disabled-state propagation across UI components, fixed Android elevation stacking on the activity detail header, and extracted a shared API base URL config.

### Mobile (`apps/mobile`)

- Corrected `OptionCard` `accessibilityRole` from `radio` to `checkbox` to match its multi-select usage.
- Added `accessibilityLabel` forwarding to `TextField`, `SkipButton`, and auth-flow links.
- Added explicit `accessibilityState={{ disabled }}` to `PrimaryButton` for reliable cross-platform disabled reporting.
- Increased back button and sign-out touch targets to meet Apple HIG / Material minimums.
- Added `elevation: 4` to the activity detail header on Android to correctly occlude scrolled content.
- Fixed recommendation card metadata row gap to use `gap-3` instead of axis-specific utilities unsupported on flex-wrap in NativeWind v4.
- Extracted `API_BASE_URL` into `lib/config.ts`, removing three duplicate env-var fallback expressions.

## 2026-05-22 — Refactor: Centralize Error Handling and DRY Rate-Limiter Setup

Cleanup pass following the backend audit fixes. Per-route `try/catch` blocks became redundant given the global error-handler, and rate-limiter configs shared a repeated shape worth factoring out.

### Backend (`packages/core`)

- Removed redundant `try/catch` from read-only route handlers now covered by the global error middleware.
- Narrowed the onboarding handler's `try/catch` to `insertProfile` only, re-throwing non-`23505` errors to the global handler.
- Extracted a `createLimiter(windowMs, limit)` factory replacing ~15 lines of near-duplicate rate-limiter config.
- Extracted a `maybeLimit(limiter)` helper replacing repeated conditional spreads at each rate-limited route mount.

## 2026-05-22 — Fix: Backend Audit High-Severity Findings

Addresses four high-severity findings from the backend code audit: authentication error leakage, missing global error handling, unthrottled read endpoints, and loose Sanity API version validation.

### Backend (`packages/core`)

- Added a global JSON error-handler and 404 middleware so all unhandled errors return `{ error: "Internal server error" }` JSON 500s instead of Express's default HTML responses.
- Moved `getSessionUserId` and `getProfileByAuthUserId` calls inside the error-handler scope to prevent non-JSON 500s on transient auth/DB failures.
- Added a `readLimiter` (120 req/min per IP) to `GET /recommendations` and `GET /activities/:slug` to prevent connection pool exhaustion.
- `readSanityConfigFromEnv` now requires `SANITY_API_VERSION` to be a `YYYY-MM-DD` string, failing fast on startup if not.

## 2026-05-22 — Fix: Cross-Site Auth Cookies for Vercel ↔ Render

Fixes the bug where sign-in succeeded but `useSession()` immediately reported no user, bouncing the web client to `/onboarding/name` on every login.

### Backend (`packages/core`)

- Set `advanced.defaultCookieAttributes` to `{ sameSite: "none", secure: true }` in the `betterAuth` config so session cookies are sent on cross-site fetch requests between the Vercel web client and Render API.

## 2026-05-22 — Fix: Auth Rate Limiting Behind Render's Proxy

Fixes the `429 Too Many Requests` lockout hit by all users sharing a single rate-limit bucket after deploying the backend to Render.

### Backend (`packages/core`)

- Set `app.set("trust proxy", 1)` so `express-rate-limit` keys by the real client IP from `X-Forwarded-For` rather than Render's load-balancer IP.
- Scoped `authLimiter` to mutation endpoints only (`sign-in`, `sign-up`, `forget-password`), removing the rate limit from `GET /api/auth/get-session`.

## 2026-05-22 — Chore: Deployment Configs for Render, Vercel, and EAS

Adds infrastructure-as-code for the three deployable artifacts — Express backend, Expo web client, and Expo mobile client — with no runtime behavior changes.

### Backend (`packages/core`)

- Added `start` script and moved `tsx` to `dependencies` for Render production installs.

### Mobile (`apps/mobile`)

- Added `vercel-build` script for Vercel static web export.
- Added `runtimeVersion: { policy: "sdkVersion" }` to `app.json` for EAS Update compatibility with Expo Go.
- Added `eas.json` with `development`, `preview`, and `production` build profiles.

### Repo Root

- Added `render.yaml` Render Web Service blueprint with monorepo-aware build and env var placeholders.
- Added `vercel.json` for the monorepo web build targeting `apps/mobile/dist`.

## 2026-05-22 — Chore: Backend Audit Fixes

Closes the critical and high findings from the backend code audit. No public API changes.

### Backend (`packages/core`)

- Made the Sanity client injectable and env-driven, constructed via factory in `index.ts` rather than at module scope.
- Added runtime Zod validation for Sanity responses; malformed or incomplete activity docs are dropped before being served.
- Added runtime validation of `personality` jsonb in the DB layer on both read and write.
- Added rate limiting on `/api/auth/*` (20 req / 15 min) and `POST /profiles` (10 req / hour) per IP.
- Added path parameter validation for `GET /activities/:slug` with a 400 on invalid slugs.
- Restricted production CORS to require at least one `https://` origin in `BETTER_AUTH_TRUSTED_ORIGINS`.

## 2026-05-22 — Feat: Activity Tips Field

Adds an optional `tips` field (max 3) to the Activity schema. Tips render on the activity detail page as callout cards with a warm background and lightbulb icon.

### Sanity Studio (`apps/sanity`)

- Added a `tips` array field to the `activity` schema, capped at 3 items via `Rule.max(3)`.

### Types (`packages/types`)

- Added `ActivityTip` type and an optional `tips?: ActivityTip[]` field on `Activity`.

### Backend (`packages/core`)

- Updated the GROQ query in `sanity-source.ts` to project the `tips` array.

### Mobile (`apps/mobile`)

- Rendered tips on the activity detail page as warm-background callout cards with a lightbulb icon and bold "Tip:" prefix.
- Added three tests and two Storybook stories (`WithTips`, `WithEverything`) for the tips section.

## 2026-05-22 — Feat: Activity Instructions Field

Adds an optional ordered `instructions` field to the Activity schema. Instructions render on the activity detail page as a numbered list with emerald step-indicator circles.

### Sanity Studio (`apps/sanity`)

- Added an `instructions` array field to the `activity` schema with drag-to-reorder and title preview.

### Types (`packages/types`)

- Added `ActivityInstruction` type and an optional `instructions?: ActivityInstruction[]` field on `Activity`.

### Backend (`packages/core`)

- Updated the GROQ query in `sanity-source.ts` to project the `instructions` array.
- Added two `source.test.ts` cases covering Sanity instruction merge and null fallback.

### Mobile (`apps/mobile`)

- Rendered instructions on the activity detail page as a numbered list with emerald step circles.
- Added three tests and two Storybook stories (`WithInstructions`, `WithDescriptionAndInstructions`) for the instructions section.

## 2026-05-21 — Feat: Sanity CMS Integration

Wires Sanity as the authoritative source for activity content, replacing the static mock dataset incrementally. Mocks serve as a fallback for any activity not yet in Sanity.

### Sanity Studio (`apps/sanity`)

- Added a Sanity Studio app with an `activity` document schema covering title, slug, type, field, related types, image, estimated time, and Portable Text description.

### Backend (`packages/core`)

- Replaced numeric `rec_NNN` ids with human-readable slugs usable as URL path segments.
- Added a merge loader that overlays Sanity-fetched activities onto the mock catalog field-by-field, with Sanity-only entries prepended.
- Added `GET /activities/:slug` — auth-required, returns the merged activity or 404.

### Mobile (`apps/mobile`)

- Moved activity detail from a query-string route to a dynamic path segment (`/activities/[slug]`), matching the backend shape.
- Detail page serves a cached copy immediately and revalidates in the background; a spinner shows on cold load.
- Removed the hardcoded AI-summary placeholder; editor-authored Portable Text description now renders in the "About this activity" section.

## 2026-05-20 — Feat: Recommendation Detail Page

New mobile screen that renders an activity's title, image, and metadata instantly from the dashboard cache, then async-loads extended content. `RecommendationCard` is reused as the hero via a new `size="large"` mode.

### Mobile (`apps/mobile`)

- Added `app/(authed)/recommendations/detail.tsx` with synchronous cache-first activity load and async extended content hydration.
- Renamed `recommendations.tsx` to `recommendations/index.tsx`; each card now navigates to `/recommendations/detail?id=`.
- Added `size="large"` prop to `RecommendationCard` for use as the detail hero.
- Added in-memory `activityCache` and `getCachedActivity` to `lib/recommendations/api.ts`; added `fetchRecommendationDetail` stub.

### Types (`packages/types`)

- Added `ActivityDetail = Activity & { aiSummary: string; description: string }`.

### Tests (`apps/mobile`)

- Added tests for the detail screen (6), recommendations index (6), and recommendation card (5).

### Stories (`apps/mobile`)

- Added Storybook stories for the detail screen (Loaded / Loading / NotFound) and recommendations index (Loaded / Loading / Error).

## 2026-05-19 — Fix: Preserve Primary Affinity When Secondary Affinities Exist

Reworked the base-score formula so a strong primary pattern match is no longer diluted by the presence of `related_types`.

### Algorithm (`packages/core`)

- Changed `calculateRecommendationBaseScore` to `primaryAffinity + secondaryAffinity * 0.2` (previously `primary * 0.7 + secondary * 0.3`), treating secondary affinity as a bonus rather than a displacement of primary signal.

### Tests (`packages/core`)

- Updated five `calculateRecommendationBaseScore` test expectations to match the new formula.

### Docs (`context`)

- Updated `recommendation-engine.md` to reflect the new base-score formula and pipeline.

## 2026-05-19 — Test: getRecommendations Integration Coverage and Activity Pool Injection

Expanded `getRecommendations` integration tests and decoupled the algorithm from its hardcoded activity source.

### Tests (`packages/core`)

- Added four `getRecommendations` integration tests covering diversification, interest surfacing, motivation end-to-end, and combined interest + motivation behaviour.

### Algorithm (`packages/core`)

- `getRecommendations` now accepts an explicit `activities: Activity[]` parameter instead of importing `RECOMMENDATIONS` directly, making it a pure function of its inputs.

## 2026-05-19 — Test: Unit Tests for calculateRecommendationBaseScore and scoreRecommendation

Added unit tests for the two private scoring functions, exported to make them directly testable.

### Tests (`packages/core`)

- Added unit tests for `calculateRecommendationBaseScore` and `scoreRecommendation` covering edge cases, motivation boost application, and boost monotonicity.

### Algorithm (`packages/core`)

- Exported `calculateRecommendationBaseScore` and `scoreRecommendation` for direct testability.

## 2026-05-19 — Feat: Recommendation Engine Interest-Aware Bucket Diversification

Replaced the post-diversification interest boost with a bucket-based, interest-first diversification pipeline. Top slots now aim for one rec per user interest before activity-type diversity kicks in.

### Algorithm (`packages/core`)

- Added `helpers/diversify.ts` with `classifyBucket` (Top / Middle / Bottom) and `diversifyAndOrder` running two layered passes: interest-first slot filling, then activity-type deduplication across remaining high-score recs.
- Replaced `getDiverseRecommendations` and `applyInterestBoost` with a single `diversifyAndOrder` call in `getRecommendations`.

### Types (`packages/types`)

- Moved `ScoredRecommendation` and `ScoredActivityType` from `packages/core` into the shared types package.

### Tests (`packages/core`)

- Added `helpers/diversify.test.ts` with 14 unit tests covering bucket classification, ordering, score preservation, and interest/type-fill behaviour.

## 2026-05-16 — Fix: Motivation Boost Dead Adjacent Branch

Reworked `calculateMotivationBoost` — the adjacent-pattern contribution was dead code because `getUserPatternWeights` always returns a complete record, so the exact-match early return was always taken.

### Algorithm (`packages/core`)

- `calculateMotivationBoost` now sums exact and adjacent contributions for every shared target pattern rather than early-returning on an exact match.

### Tests (`packages/core`)

- Added a test for the exact + adjacent summation case; updated import to the renamed `getMotivationAndActivitySharedPatterns` helper.

## 2026-05-15 — Feat: Recommendation Engine Motivation Boost, Interest Boost, and Diversification

Three new scoring stages added to the recommendation pipeline — diversification, motivation boost, and interest boost — along with a fix to OCEAN score derivation from BFAS aspects.

### Algorithm (`packages/core`)

- Added diversification (`getDiverseRecommendations`) to ensure no two results share the same primary `ActivityType`.
- Added motivation boost using EXACT / STRONG_ADJACENT / WEAK_ADJACENT NEO pattern adjacency weights.
- Added interest boost sorting interest-matching recs to the front before the final slice.
- Split `helpers.ts` into `ocean.ts`, `patterns.ts`, and `motivation.ts`; fixed `getOCEANScores` to derive each trait from its true BFAS parent aspects.

### Validation (`packages/core`)

- Motivations array now requires `.min(1)`; submissions with no motivation selected are rejected.

### Types (`packages/types`)

- Moved `Motivation` type from `packages/core` into the shared types package.

## 2026-05-10 — Feat: NEO Pattern Recommendation Scoring

Replaced per-trait OCEAN alignment scoring with a NEO pattern-strength model scoring each activity against the user's fit across 40 IPIP-NEO pattern types.

### Types (`packages/types`)

- Added `OCEANScores`, `TraitLevel`, `PatternTypeId`, `PatternGroup`, and `PatternType`.
- Replaced `ACTIVITY_TYPE_BFAS_MAPPING` with `patternGroups`, `patternTypes`, and `ActivityTypePatterns` in `constants.ts`.

### Backend (`packages/core`)

- Added `lib/helpers.ts` with `getOCEANScores`, `calculatePatternStrength`, `getUserPatternStrengths`, and `calculateActivityPatternAffinity`.
- Rewrote `getRecommendations` to score via BFAS → OCEAN → pattern strengths, using a `0.7 * primary + 0.3 * secondary` affinity formula.
- Added 8 unit tests for the new helpers.

### Mocks (`packages/mocks`)

- Corrected `rec_072` activity type from `Creative` to `Performative` and removed duplicate `related_types` entry.

### Docs (`context`)

- Updated `recommendation-engine.md` with the IPIP-NEO pattern catalog and four-stage algorithm flow.

## 2026-05-08 — Fix: Frontend Code Audit Findings

Resolved issues surfaced by a frontend audit: null-safety on API responses, broken image fallback, missing accessibility attributes, `ScrollView` on a dynamic list, silent profile-creation errors, and localhost env-var leak.

### Mobile (`apps/mobile`)

- Added null guard (`?? []`) on `body.recommendations` to prevent runtime crash on malformed API responses.
- Added `onError` fallback to `expo-image` in `RecommendationCard`; set explicit image height to prevent layout shift.
- Added `accessibilityRole` and `accessibilityLabel` to `PrimaryButton`, `Chip`, and `OptionCard`.
- Replaced `ScrollView + .map()` with `FlatList` in the recommendations screen; added `signingOut` loading state for sign-out buttons.
- Classified profile-creation errors (network vs. server) and surfaced a specific message in the loading screen.
- Gated `localhost` fallback for `EXPO_PUBLIC_API_BASE_URL` on `__DEV__`; production builds throw if the variable is unset.

## 2026-05-08 — Fix: Backend Security and Validation Findings

Resolved five issues surfaced by a backend audit: CORS wildcard, missing env guard, unvalidated jsonb, duplicate-profile 500, and raw Zod errors in responses.

### Backend (`packages/core`)

- Replaced CORS `origin: true` with an explicit `trustedOrigins` allowlist shared between `cors` middleware and `betterAuth`.
- Added a startup guard for `BETTER_AUTH_URL`, matching the existing guard for `BETTER_AUTH_SECRET`.
- Added runtime `bfasScoresSchema` validation of `personality` jsonb after DB fetch.
- `POST /profiles` now pre-checks for an existing profile and returns 409; a second 409 path handles the `23505` race condition.
- Zod validation errors on `POST /profiles` are mapped to `{ path, message }` pairs before being sent.

## 2026-05-08 — Fix: Authed Route Group and Sign-In Race

Locks down `/recommendations` behind a session gate and fixes a race that bounced freshly signed-in users back to the onboarding flow.

### Mobile (`apps/mobile`)

- Added `app/(authed)/_layout.tsx` with a session gate that redirects unauthenticated users to `/onboarding/name` and renders a spinner while the session is pending.
- `app/sign-in.tsx` now awaits `useSession().refetch()` after `signIn.email()` before navigating, preventing a stale-session bounce to onboarding.
- Added Jest setup and a first integration test (`authed-layout.test.tsx`) covering the gate's three states.

## 2026-05-08 — Feat: Better Auth (Email and Password)

Added Better Auth as the auth layer with sign-up, sign-in, sign-out, persisted sessions, and a session-driven API.

### Backend (`packages/core`)

- Configured `better-auth` with the Drizzle adapter; email/password auth enabled with an 8-char minimum.
- Added `getSessionUserId(req)` helper injected into route handlers for testable session lookup.
- Replaced the `users` table with `profiles` and a one-to-one `auth_user_id` FK to the Better Auth `user` table.
- `POST /profiles` and `GET /recommendations` now require a valid session; return 401 unauthenticated or 404 on missing profile.
- Added a single migration creating the four Better Auth tables and the `profiles` schema.

### Mobile (`apps/mobile`)

- Added `lib/auth/client.ts` with native (`expo-secure-store`) and web (`credentials: "include"`) auth configurations.
- Added `lib/auth/fetch.ts` `authedFetch` helper attaching session credentials for both platforms.
- Extended the onboarding name screen with email, password, and confirm-password fields with inline validation and error handling.
- Added `app/sign-in.tsx` for returning users.
- `app/index.tsx` routes signed-in users to `/recommendations` and everyone else to `/onboarding/name`.

## 2026-05-04 — Refactor: Move Shared Types Into `@touchgrass/types`

Moved mobile-private activity, field, and Big Five personality types into a shared workspace package for use across the monorepo.

### Types (`packages/types`)

- Moved `apps/mobile/lib/types.ts` to `packages/types/index.ts`; exposed via `main` and `types` in `package.json` with no build step required.

### Mobile (`apps/mobile`)

- Replaced five `@/lib/types` import sites with `@touchgrass/types`.

## 2026-05-04 — Chore: Monorepo Restructure

Converted the repo to an npm-workspace monorepo with `apps/*` and `packages/*`. All source files were moved with `git mv`; no app code was modified.

### Repo Root

- Root `package.json` is now a workspace manifest with proxy scripts delegating to `@touchgrass/mobile`.
- Updated `metro.config.js` for monorepo `watchFolders` and `nodeModulesPaths`.
- Updated `.gitignore` for Storybook auto-generated files and Expo native folder patterns under the new layout.
- Created stub workspaces: `apps/web/`, `packages/core/`, `packages/types/`.

## 2026-05-03 — Feat: Storybook for React Native

Added Storybook (`@storybook/react-native` v10) with on-device addons and stories for every existing UI component.

### Mobile (`apps/mobile`)

- Configured Storybook with `withStorybook` Metro wrapper, gated by `EXPO_PUBLIC_STORYBOOK=true`.
- Added `storybook[:ios|:android|:web]` scripts and a `storybook-env.d.ts` reference for `require.context` types.
- Authored stories for all existing components: `GrassLogo`, `OnboardingProgress`, `OnboardingScreenShell`, `SkipButton`, `RecommendationCard`, `Chip`/`ChipGroup`, `FieldRow`, `OptionCard`, `PrimaryButton`, `Slider`, `TextField`.

## 2026-04-30 — Feat: Onboarding Phase 2 — Form Submission

Migrated the onboarding flow to React Hook Form with end-to-end validation and a post-submission loading screen.

### Mobile (`apps/mobile`)

- Migrated `OnboardingProvider` to wrap a `FormProvider`; each screen now consumes the form via `useOnboardingForm()`.
- Added field validation across all five onboarding screens; Interests screen remains optional.
- Added `app/onboarding/loading.tsx` post-submission screen with spinner and redirect to recommendations.

## 2026-04-30 — Feat: Recommendations Config

Extracted recommendation mock data into a typed config and expanded the dataset to 100 entries covering all activity type and field combinations.

### Mobile (`apps/mobile`)

- Extracted `RECOMMENDATIONS` array and `Recommendation` type into `lib/recommendations.ts`.
- Expanded mock dataset to 100 entries spanning all 10 activity types and 20 fields.
- Added optional `related_types?: ActivityType[]` field to the `Recommendation` type.

## 2026-04-26 — Feat: Recommendation Card Icons

Added an icon lookup system mapping activity types and fields to lucide icons, and updated `RecommendationCard` to render type, field, and estimated-time icons.

### Mobile (`apps/mobile`)

- Added `lib/icons.ts` mapping all 10 activity types and 20 fields to lucide icons with fallbacks.
- Updated `RecommendationCard` to render type and field icons.
- Added optional `estimatedTime` prop to `RecommendationCard`, rendered with a clock icon.
