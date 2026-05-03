# Current Feature

## Summary

Set up Storybook for React Native (`@storybook/react-native` v10) and add stories for every existing component in `components/`.

## Requirements

- Install `@storybook/react-native` v10 + on-device addons (controls, actions, backgrounds, notes) and `@react-native-async-storage/async-storage` for persistence.
- Add `.storybook/` config: `main.ts`, `preview.tsx`, `index.ts`. Stories glob from `components/**/*.stories.*`.
- Wire `withStorybook` Metro plugin gated by `EXPO_PUBLIC_STORYBOOK=true`; toggle the entry between `expo-router/entry` (default) and the Storybook UI via a custom `index.js`.
- Add `npm run storybook[:ios|:android|:web]` scripts.
- Author one `*.stories.tsx` file per existing component:
  - `components/icons/grass-logo.tsx`
  - `components/onboarding/{progress,screen-shell,skip-button}.tsx`
  - `components/recommendations/recommendation-card.tsx`
  - `components/ui/{chip,field-row,option-card,primary-button,slider,text-field}.tsx`
- Lint and `tsc --noEmit` must pass; gitignore the auto-generated `.storybook/storybook.requires.ts`.

## Notes

- Default app behaviour (`npm start`) is unchanged — the Metro plugin stubs Storybook imports when the env flag is off.
- NativeWind classes work inside stories because the global `babel-preset-expo` + `nativewind/babel` chain still applies; `preview.tsx` imports `global.css`.
- End-to-end on-device boot has not been verified yet.
