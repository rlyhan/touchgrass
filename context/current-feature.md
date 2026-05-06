# Update local env commands

## Summary

We need to update our commands to the following:
- npm start (root directory): Needs to run both its current command AND run the npm run dev command in packages/core
- npm run storybook commands: Needs to run on a different server than 8081 which is what our mobile app runs on

## Parent Branch
recommendation-engine-v1

## Requirements

- Root `npm start` must run the existing mobile workspace start command AND `npm run dev` in `packages/core` concurrently.
  - Both processes should stream output to the same terminal with clear labels.
  - Stopping the root command (Ctrl+C) should cleanly terminate both child processes.
- All `npm run storybook*` commands must use a port different from `8081` (the Expo/Metro port for the mobile app) so Storybook and the mobile app can run simultaneously without conflict.
  - This applies to `storybook`, `storybook:ios`, `storybook:android`, and `storybook:web`.

## Notes
