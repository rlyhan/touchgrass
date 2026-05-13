# Make motivation selection mandatory

## Summary

Currently in the onboarding screen, the user can proceed to recommendations without selecting a motivation. We need them to select at least one motivation.

## Parent Branch
feat/motivation-boost

## Requirements

- Add `.min(1)` to the `motivations` array in `onboardingFormSchema` (`packages/core/src/onboarding/schema.ts`) so the backend rejects submissions with no motivations selected
- The mobile screen (`apps/mobile/app/onboarding/motivation.tsx`) already disables the Finish button and validates client-side — no changes needed there

## Implementation

## Notes
