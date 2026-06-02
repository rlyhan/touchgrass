# Touchgrass

A mobile app that helps people who feel stuck or stagnant discover meaningful, realistic activities and hobbies — personalised to who they are right now.

---

## Monorepo structure

```
apps/
  mobile/     Expo (React Native) app — iOS, Android, and web
  sanity/     Sanity Studio CMS for managing activity content
  web/        Web app stub (in progress)
packages/
  core/       Express API server — auth, profiles, recommendations
  types/      Shared TypeScript types
  mocks/      Shared mock data for tests
```

---

## Prerequisites

- **Node.js** 20+
- **npm** 10+ (workspaces used throughout)
- **Expo Go** app on a physical device, or Xcode (iOS Simulator) / Android Studio (Android Emulator)
- An [Expo account](https://expo.dev) for EAS builds/updates

---

## Environment setup

Copy the example and fill in values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (pooled) |
| `BETTER_AUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base URL of the running API (e.g. `http://localhost:3000` locally) |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated list of allowed client origins (leave unset locally) |
| `SANITY_PROJECT_ID` | Sanity project ID |
| `SANITY_DATASET` | Sanity dataset name (e.g. `production`) |
| `SANITY_API_VERSION` | Sanity API version as `YYYY-MM-DD` (e.g. `2024-01-01`) |

`EXPO_PUBLIC_API_BASE_URL` is not needed locally — the mobile app falls back to `http://localhost:3000` in dev mode.

---

## Local development

Install all workspace dependencies from the repo root:

```bash
npm install
```

Start both the API server and Expo dev server together:

```bash
npm start
```

This runs `@touchgrass/core` (Express on port 3000) and `@touchgrass/mobile` (Expo) concurrently. Both must be running for auth, profiles, and recommendations to work.

> **Note:** `npm start` uses `concurrently`, which prefixes log output and breaks QR code rendering in the terminal. If you need to scan a QR code to open the app in Expo Go on a physical device, run the two servers in separate terminals instead (see below).

**Physical device (Expo Go) — separate terminals:**

```bash
# Terminal 1 — API server
npm run dev --workspace=@touchgrass/core

# Terminal 2 — Expo dev server (QR code renders correctly here)
cd apps/mobile && npx expo start
```

Then scan the QR code with the **Expo Go app** on your device (not the native camera).

**Platform-specific (simulators/emulators):**

```bash
npm run ios       # iOS Simulator — native dev build (requires bundleIdentifier in app.json)
npm run android   # Android Emulator — native dev build
npm run web       # Browser at http://localhost:8081
```

> **Note:** `npm run ios` / `npm run android` compile a native development build. This is slower to start than Expo Go but reflects real device behaviour more accurately. The `bundleIdentifier` (`com.rlyhan.touchgrass`) in `apps/mobile/app.json` is required for these commands.

**Release build (accurate performance testing — animations, transitions):**

Expo Go and native dev builds both run JavaScript in debug mode, which can make animations appear slow. For a production-accurate test, build in release mode:

```bash
cd apps/mobile
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000 npx expo run:ios --configuration Release
```

This must be run from `apps/mobile`, not the repo root.

**Run workspaces individually:**

```bash
# API only
npm run dev --workspace=@touchgrass/core

# Mobile only
npm run start --workspace=@touchgrass/mobile

# Sanity Studio
npm run dev --workspace=@touchgrass/sanity
```

**Lint:**

```bash
npm run lint
```

**Tests:**

```bash
npm run test --workspace=@touchgrass/core
```

---

## Database migrations

Migrations live in `packages/core/drizzle/`. Run against the target database:

```bash
# local (.env.local)
npm run db:migrate --workspace=@touchgrass/core

# production (override DATABASE_URL inline)
DATABASE_URL='<prod url>' npm run db:migrate --workspace=@touchgrass/core
```

---

## Deployment

| Artifact | Host | Config |
|---|---|---|
| API — prod (`packages/core`) | [Fly.io](https://fly.io) | `fly.prod.toml` |
| API — QA (`packages/core`) | [Fly.io](https://fly.io) | `fly.toml` |
| Web client — prod (`apps/mobile`) | [Vercel](https://vercel.com) (`main` branch) | `vercel.json` |
| Web client — QA (`apps/mobile`) | [Vercel](https://vercel.com) (`qa` branch) | `vercel.json` |
| Mobile (Expo Go) | EAS Update | `apps/mobile/eas.json` |

**Fly.io** — each environment is a separate Fly app. See the header comments in `fly.prod.toml` and `fly.toml` for first-time setup steps. Deploy with:

```bash
fly deploy --config fly.prod.toml   # production
fly deploy                          # QA (fly.toml)
```

**Vercel** — two separate Vercel projects share `vercel.json` for build config. Each project sets its own `EXPO_PUBLIC_API_BASE_URL` env var pointing at the appropriate Fly app. The web client calls the API directly — no proxy layer.

| Vercel project | Branch | `EXPO_PUBLIC_API_BASE_URL` |
|---|---|---|
| `touchgrass-mobile` (prod) | `main` | `https://touchgrass-api-prod.fly.dev` |
| `touchgrass-mobile-qa` (QA) | `qa` | `https://touchgrass-api-qa.fly.dev` |

**EAS Update** (Expo Go testers):

```bash
cd apps/mobile
eas login
eas init          # first time only — writes projectId to app.json
eas update:configure  # first time only — writes updates.url to app.json

# QA / preview testers
EXPO_PUBLIC_API_BASE_URL=https://touchgrass-api-qa.fly.dev \
  eas update --branch preview --message "description"

# Production
EXPO_PUBLIC_API_BASE_URL=https://touchgrass-api-prod.fly.dev \
  eas update --branch production --message "description"
```

---

## Stack

| Layer | Technology |
|---|---|
| Mobile / web client | React Native, Expo SDK 54, Expo Router v6 |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| API server | Express 5, TypeScript, tsx |
| Auth | better-auth with Expo plugin |
| Database | Neon (PostgreSQL serverless), Drizzle ORM |
| CMS | Sanity Studio v3 |
| Icons | lucide-react-native |
| Testing | Node built-in test runner (`node:test`) |
