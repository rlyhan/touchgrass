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

**Platform-specific:**

```bash
npm run ios       # iOS Simulator
npm run android   # Android Emulator
npm run web       # Browser at http://localhost:8081
```

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
| API (`packages/core`) | [Render](https://render.com) free Web Service | `render.yaml` |
| Web client (`apps/mobile`) | [Vercel](https://vercel.com) | `vercel.json` |
| Mobile (Expo Go) | EAS Update | `apps/mobile/eas.json` |

**Render** reads `render.yaml` automatically when you connect the repo. Set the seven env vars listed above in the Render dashboard (add `BETTER_AUTH_TRUSTED_ORIGINS` once the Vercel URL is known).

**Vercel** reads `vercel.json` from the repo root. Set `EXPO_PUBLIC_API_BASE_URL` to your Render service URL in the Vercel project settings.

**EAS Update** (Expo Go testers):

```bash
cd apps/mobile
eas login
eas init          # first time only — writes projectId to app.json
eas update:configure  # first time only — writes updates.url to app.json
EXPO_PUBLIC_API_BASE_URL=https://<render-url>.onrender.com \
  eas update --branch preview --message "description"
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
