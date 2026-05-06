# Expand ActivityType definition

## Summary

The current activity type configuration is too narrow. Update the type to this:

type ActivityType =
  | "Creative"
  | "Artistic"
  | "Constructive"
  | "Expressive"
  | "Performative"

  | "Intellectual"
  | "Analytical"
  | "Educational"
  | "Reflective"

  | "Active"
  | "Physical"
  | "Skill-based"
  | "Competitive"

  | "Adventurous"
  | "Outdoorsy"
  | "Exploratory"
  | "Experimental"

  | "Social"
  | "Collaborative"
  | "Leadership"
  | "Community-oriented"

  | "Professional"
  | "Goal-oriented"
  | "Disciplined"
  | "Strategic"

  | "Mindful"
  | "Therapeutic"
  | "Emotional"

  And then make changes accordingly.

  We also need to update the related_types in each of the mock recommendations in packages/mocks/recommendations.ts with zero to a few closely related types.

## Parent Branch
recommendation-engine-v1

## Requirements

- Replace the current `ActivityType` union in `packages/types/index.ts` with the expanded set of 27 types listed above (grouped into 7 thematic clusters).
- Preserve the existing grouping/order so future readers can see the thematic clusters at a glance.
- Propagate the change everywhere `ActivityType` is referenced in TypeScript source so the project type-checks cleanly.
- Update any constants that enumerate activity types (e.g. `packages/types/constants.ts`) to match the new set.
- Do **not** modify `related_types` values in `packages/mocks/recommendations.ts` in this subfeature — that is the next subfeature. However, if existing `type` values on mocks become invalid under the new union, map them to the closest new type so the file still compiles.
- Run `npm run lint` and any typecheck to confirm nothing is broken before considering the subfeature complete.

## Notes
