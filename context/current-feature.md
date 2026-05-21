# Add instructions field to Activity in Sanity

## Summary

An optional field for Activity, where you can add multiple instruction objects with a Title and Description. Can drag to re-order.

In the template, it should automatically render a number (from 1 to X, dependent on sort ordering) to the left of it enclosed in a circle.

## Parent Branch

## Requirements

- Add an optional `instructions` field to the Activity Sanity schema in `apps/sanity/schemaTypes/activity.ts`
  - Type: `array` of inline objects (drag-to-reorder is enabled by default for Sanity arrays)
  - Each item is an object with two fields:
    - `title` (string, required when item is present)
    - `description` (Portable Text — same minimal block config as the existing `description` field: normal paragraph style, bold/italic decorators only, no lists, no annotations)
  - The whole field stays optional (no `Rule.required()` at the array level)
  - Item preview shows the `title` so editors can identify items while reordering
- Extend the `Activity` type in `packages/types/index.ts` with an optional `instructions?: ActivityInstruction[]` where each `ActivityInstruction` has `title: string` and `description?: string`
- Update the Sanity GROQ query in `packages/core/src/recommendations/sanity-source.ts` to project the new `instructions` field (preserving order)
- Render instructions on the activity detail page (`apps/mobile/app/(authed)/activities/[slug].tsx`):
  - Only render when `activity.instructions` is present and non-empty
  - Section heading "Instructions" above the list (consistent with the existing "About this activity" heading style)
  - Each item displays a numbered circle on the left (1, 2, 3… based on array order), with the item's title and plain-text description to the right
- Tests: add coverage in `apps/mobile/__tests__/activity-detail.test.tsx` for (a) showing the section + numbered items when instructions are present, and (b) hiding the section when they are absent or empty

## Notes

- Sanity arrays already support drag-to-reorder by default, so no custom component is required for ordering.
- The numbered circle is rendered client-side from the array index, not stored — keep order purely positional.
- Instruction description is plain text (`type: 'text'`), not Portable Text — simpler editor UX.
- Mobile rendering uses NativeWind classes (existing convention in the project).
- Existing tests (`activity-detail.test.tsx`) construct a fake activity inline, so add an `ACTIVITY_WITH_INSTRUCTIONS` fixture in that test file.
