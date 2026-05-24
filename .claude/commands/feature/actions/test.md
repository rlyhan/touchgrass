# Test Action

1. Read current-feature.md to understand what was implemented

2. Identify which workspaces were touched:
   - `packages/core` — Express API (route handlers, middleware, helpers in `src/lib/`)
   - `apps/mobile` — Expo app (components, hooks, screens)

3. Check if tests already exist for the new/modified files (look for `*.test.ts(x)` siblings in `packages/core/src/` or files under `apps/mobile/__tests__/`)

4. For untested code with meaningful logic, write tests using the runner that workspace already uses:
   - **`packages/core`** — Node's built-in test runner (`node:test` + `node:assert`). Mirror the patterns in existing tests like [packages/core/src/lib/recommendation-algorithm.test.ts](packages/core/src/lib/recommendation-algorithm.test.ts) and [packages/core/src/recommendations/route.test.ts](packages/core/src/recommendations/route.test.ts). Cover route handlers, middleware, schema validators, and pure helpers.
   - **`apps/mobile`** — Jest + `@testing-library/react-native` via the `jest-expo` preset. Mirror patterns in [apps/mobile/__tests__/](apps/mobile/__tests__/). Components, hooks, and screens are all fair game.
   - Test happy path and meaningful error cases. Skip trivial wrappers — use judgment.

5. Run tests for the affected workspace(s):
   - Core: `npm test --workspace=@touchgrass/core`
   - Mobile: `npm test --workspace=@touchgrass/mobile`

6. Report which new files now have tests and confirm the suite passes.
