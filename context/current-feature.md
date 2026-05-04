# Switch onboarding personality screen to BFAS traits

## Summary

Currently, we are using the PERSONALITY_TRAITS in packages/types/index.ts to get people to enter their personality types.

We need to replace this with BFAS_TRAITS in the same file.

We need to update the personality screen in the onboarding form to be using the BFAS_TRAITS, which is simple as it already have the exact same data format as PERSONALITY_TRAITS.

## Parent Branch
recommendation-engine-v1

## Requirements

- Replace `PERSONALITY_TRAITS` with `BFAS_TRAITS` in [apps/mobile/app/onboarding/personality.tsx](apps/mobile/app/onboarding/personality.tsx) (import, validate, and map).
- Update [apps/mobile/lib/onboarding-context.tsx](apps/mobile/lib/onboarding-context.tsx) so the `personality` form field is typed as `BFASScores` and initialized from `DEFAULT_BFAS_SCORES`.
- Remove the skip option from the personality screen (the section is mandatory) — drops `SkipButton`, the `skip` handler, and the now-unused `setValue` / `DEFAULT_BFAS_SCORES` import.
- Group the 10 BFAS sliders by their parent Big Five domain on the personality screen, with a subheading per group (e.g. "Openness to Experience" above the Openness/Intellect pair). Add a `BFAS_PARENT_LABELS: Record<PersonalityType, string>` map to [packages/types/index.ts](packages/types/index.ts) for the display names.
- Verify the screen renders all 10 BFAS sliders grouped under 5 subheadings without TypeScript errors and that Continue advances to `/onboarding/motivation`.

## Notes

- Refer to types in packages/types/index.ts
- `BFASTraitDefinition` shares `key`/`label`/`description`/`lowLabel`/`highLabel` with `PersonalityTrait`, so the `<Slider>` props in personality.tsx don't need restructuring.
- `DEFAULT_BFAS_SCORES` already exists at packages/types/index.ts:247.
- Downstream consumers of `personality` (recommendation engine) are out of scope for this micro-feature — that is parent-branch work.