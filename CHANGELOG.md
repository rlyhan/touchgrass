# Changelog

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
