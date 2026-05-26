# Touchgrass

A mobile application to help users discover new hobbies, activities, and experiences that feel personally meaningful and realistically achievable.

---

## Context Files

Read the following to get full project context before making changes:

* context/current-feature.md
* context/conding-standards.md
* context/documentation.md
* context/project-overview.md
* context/recommendation-engine.md
* context/workflow.md

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

### Mobile (`apps/mobile`)

* React Native
* Expo (SDK 54)
* Expo Router (file-based routing)
* TypeScript
* NativeWind v4 (TailwindCSS for React Native)
* react-native-svg
* react-native-gesture-handler
* react-native-screens
* react-native-reanimated
* react-native-safe-area-context
* lucide-react-native, @expo/vector-icons (icons)
* expo-image, expo-linear-gradient
* expo-haptics, expo-secure-store, expo-network
* @react-native-async-storage/async-storage
* @react-native-community/slider
* @react-navigation/native, bottom-tabs, elements (used alongside Expo Router for tab nav)
* better-auth + @better-auth/expo (auth)
* react-hook-form (forms)
* Storybook (`@storybook/react-native`) — component development
* Jest / jest-expo — testing
* ESLint

### Backend (`packages/core`)

* Node.js + Express v5
* TypeScript (tsx runner)
* Better Auth — auth framework
* Drizzle ORM + drizzle-kit — ORM and migrations
* Neon (`@neondatabase/serverless`) — PostgreSQL
* Zod — request validation
* express-rate-limit
* @sanity/client — Sanity content queries

### CMS (`apps/sanity`)

* Sanity v5 + Sanity Studio
* @sanity/vision (GROQ query explorer)

---

## Deployment configs

| File | Purpose |
|---|---|
| `fly.prod.toml` | Fly.io config for production API (`touchgrass-api-prod`) |
| `fly.toml` | Fly.io config for QA API (`touchgrass-api-qa`) |
| `vercel.json` | Vercel build config — shared by both prod and QA Vercel projects |
| `apps/mobile/eas.json` | EAS build/update profiles (`development`, `preview`, `production`) |

Deployed services:
- **API (prod)** → Fly.io (`https://touchgrass-api-prod.fly.dev`)
- **API (QA)** → Fly.io (`https://touchgrass-api-qa.fly.dev`)
- **Web client (prod)** → Vercel, `main` branch (`https://touchgrass-mobile.vercel.app`)
- **Web client (QA)** → Vercel, `qa` branch (`https://touchgrass-mobile-qa.vercel.app`)
- **Mobile (Expo Go)** → EAS Update, `preview` branch (QA) / `production` branch

## QA workflow

The `qa` branch is the integration branch for testing before merging to `main`.

- Feature branches merge into `qa` first
- Vercel QA (`touchgrass-mobile-qa.vercel.app`) auto-deploys from `qa`
- Fly QA (`touchgrass-api-qa.fly.dev`) is deployed manually with `fly deploy`
- Both use `EXPO_PUBLIC_API_BASE_URL` to point directly at their respective Fly app — no proxy
- Once QA is validated, open a PR from `qa → main`

---

## Notes

This project uses:

```json
"main": "expo-router/entry"
```

This means Expo Router conventions should always be preferred over manually configuring raw React Navigation.

Avoid generating traditional React Navigation boilerplate when routing can be handled with Expo Router file-based navigation.

Also verify whether NativeWind is installed if Tailwind styling is expected in React Native, since plain Tailwind alone does not provide full React Native utility class support.
