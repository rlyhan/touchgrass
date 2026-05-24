## Coding Standards

### General

* Use TypeScript strictly — avoid `any`; use type guards and narrowing instead
* Prefer functional components; no class components
* Keep components small and focused on a single responsibility

---

### Mobile (`apps/mobile`)

#### Components

* **Named exports only** — no `export default` for components
* Define props inline above the component as `type Props` or `interface ComponentNameProps`
* Use the `@/` path alias for all intra-app imports (e.g. `@/components/...`, `@/lib/...`)

#### Styling

* NativeWind `className` is the primary styling mechanism
* Fall back to the `style` prop only for values NativeWind cannot express:
  * Aspect ratios (`{ aspectRatio: 4/3 }`)
  * Percentage dimensions (`{ width: "100%", height: "100%" }`)
  * Computed/dynamic colour values
* Never mix raw `StyleSheet.create` with NativeWind on the same element

#### Accessibility

* All interactive elements (`Pressable`, custom buttons, etc.) must include:
  * `accessibilityRole`
  * `accessibilityLabel`
  * `accessibilityState` where relevant (e.g. `{ disabled }`)

#### Navigation

* Prefer Expo Router file-based conventions over raw React Navigation boilerplate
* Use `@react-navigation/bottom-tabs` only for tab layouts that Expo Router exposes via `_layout.tsx`

#### Lists

* Use `FlatList` for any dynamic data list of unknown length — never `ScrollView + .map()`
* Always provide `keyExtractor`, a stable `renderItem` (via `useCallback`), `ItemSeparatorComponent`, and `initialNumToRender`

#### Env & Config

* `EXPO_PUBLIC_*` fallbacks to `localhost` must be gated on `__DEV__` — production builds should throw immediately if a required variable is unset
* The `reactCompiler` experiment in `app.json` is **disabled** — its output can produce Hermes bytecode incompatible with Expo Go; do not re-enable unless targeting a custom dev client

#### Forms

* Use `react-hook-form` with `FormProvider` / `useFormContext` for multi-step or shared forms
* Type forms explicitly: `useForm<MyFormValues>()`

#### Testing

* Write tests in `__tests__/` using `@testing-library/react-native` and `jest-expo`
* Mock all native/Expo deps at the top of each test file (expo-image, expo-linear-gradient, lucide, etc.)
* Structure with `describe` + `it`; reset state with `beforeEach(() => jest.clearAllMocks())`
* Assert with `screen.getByText`, `screen.getByTestId`, `screen.queryBy*`

#### Storybook

* Every component in `components/` (including `ui/`, `recommendations/`, `onboarding/`, `icons/`) must have a co-located `.stories.tsx` file
* Use `satisfies Meta<typeof Component>` and `StoryObj<typeof meta>` for type safety
* Use `fn()` from `storybook/test` for action/callback props

---

### Backend (`packages/core`)

* **Dependency injection** — route handlers accept a typed `Deps` object rather than importing dependencies directly; this keeps handlers unit-testable without mocking modules
* **Validate all route inputs with Zod** — define schemas in a co-located `schema.ts`
* **Early returns** for auth and not-found errors — avoid deeply nested conditionals in handlers
* Use `.js` extensions on all local imports (required for Node ESM)
* Avoid premature backend work unless specifically requested
* Prioritise UI and recommendation experience before new infrastructure

---

### Priorities

* UI quality and recommendation experience come first
* Infrastructure and backend work only when explicitly required
