# Touchgrass

A mobile application to help users discover new hobbies, activities, and experiences that feel personally meaningful and realistically achievable.

---

## Context Files

Read the following to get full project context before making changes:

* context/project-overview.md
* context/workflow.md
* context/current-feature.md

Always read context files before implementing features.

---

## Monorepo structure

```
apps/mobile/    Expo (React Native) app
apps/sanity/    Sanity Studio CMS
apps/web/       Web app stub
packages/core/  Express API server (auth, profiles, recommendations)
packages/types/ Shared TypeScript types
packages/mocks/ Shared mock data for tests
```

All workspace scripts are run from the repo root via `--workspace=` flag.
`apps/mobile` is `@touchgrass/mobile`, `packages/core` is `@touchgrass/core`, etc.

---

## Environment

`.env.local` at the repo root is required for local development. Variables:

```
DATABASE_URL          Neon PostgreSQL connection string
BETTER_AUTH_SECRET    Random secret for better-auth
BETTER_AUTH_URL       API base URL (http://localhost:3000 locally)
BETTER_AUTH_TRUSTED_ORIGINS  Comma-separated allowed client origins (omit locally)
SANITY_PROJECT_ID
SANITY_DATASET
SANITY_API_VERSION    Must be YYYY-MM-DD format
```

`EXPO_PUBLIC_API_BASE_URL` is not needed locally — the mobile app defaults to
`http://localhost:3000` in dev mode.

---

## Setup

If not already in the project directory:

```bash
cd touchgrass
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm start
```

This starts **both** `@touchgrass/core` (Express on port 3000) and
`@touchgrass/mobile` (Expo) concurrently. Both must run for auth,
profiles, and recommendations to work locally.

For platform-specific development:

```bash
npm run ios
npm run android
npm run web
```

Lint project:

```bash
npm run lint
```

---

## Stack

* React Native
* Expo (SDK 54)
* Expo Router (file-based routing)
* TypeScript
* NativeWind v4 (TailwindCSS for React Native)
* react-native-svg
* lucide-react-native (icons)
* expo-image, expo-linear-gradient
* react-native-safe-area-context
* react-native-reanimated
* ESLint

---

## Deployment configs

| File | Purpose |
|---|---|
| `render.yaml` | Render Web Service blueprint for `packages/core` |
| `vercel.json` | Vercel static build config — runs `apps/mobile` web export |
| `apps/mobile/eas.json` | EAS build/update profiles (`development`, `preview`, `production`) |

Deployed services:
- **API** → Render (`https://touchgrass-api-81dp.onrender.com`)
- **Web client** → Vercel (`https://touchgrass-mobile.vercel.app`)
- **Mobile (Expo Go)** → EAS Update, `preview` branch

---

## Notes

This project uses:

```json
"main": "expo-router/entry"
```

This means Expo Router conventions should always be preferred over manually configuring raw React Navigation.

Avoid generating traditional React Navigation boilerplate when routing can be handled with Expo Router file-based navigation.

Also verify whether NativeWind is installed if Tailwind styling is expected in React Native, since plain Tailwind alone does not provide full React Native utility class support.
