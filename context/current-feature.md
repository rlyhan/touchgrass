# Update Motivation type and onboarding selection

## Summary

The MOTIVATION_OPTIONS data structure has now been updated, and the code now needs to reflect these changes.

-Creation of a Motivation type
-The onboarding screen for motivation selection should display the label field and submit the value field
-Any test updates

## Parent Branch
recommendation-engine-v1

## Requirements

- Define a `Motivation` type that matches the shape of entries in `MOTIVATION_OPTIONS` (`value`, `label`, `associated_activity_types`).
  - Place it alongside related onboarding types (e.g. in `apps/mobile/lib/onboarding/types.ts` or the shared `@touchgrass/types` package, matching existing conventions).
  - Annotate `MOTIVATION_OPTIONS` with `Motivation[]` (or `readonly Motivation[]`) so the structure is type-checked.
- Fix `apps/mobile/app/onboarding/motivation.tsx` so the option list works with the new object shape:
  - Render `option.label` as the visible card text.
  - Toggle/store `option.value` (a string) in the form's `motivations` array — not the whole object.
  - Update the `selected` check to compare against `option.value`.
- Verify the form value type for `motivations` is `string[]` (the persisted/submitted shape) and update `OnboardingFormValues` if needed.
- Confirm no other consumer of `MOTIVATION_OPTIONS` breaks under the new shape.
- Update or add tests covering the motivation selection behavior, if test coverage exists for onboarding.
- Run `npm run lint` and typecheck after changes.

## Notes
