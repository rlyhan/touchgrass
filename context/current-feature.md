# Add Tips field to Activity schema in Sanity 

## Summary

An optional tips field with up tp 3 tip objects that consist of:
- Unique identifier (can be auto-generated as something like: (activity-id)-tip-0)
- Text description

When rendered, it should be in a curved corner box with a pale orange-brown background, a lightbulb icon to the left, and the text description prepended with "Tip:" in bold.

## Parent Branch

## Requirements

- Add `tips` optional array field (max 3 items) to the `activity` Sanity schema in `apps/sanity/schemaTypes/activity.ts`. Each tip object has:
  - `key` — string, auto-generated from the activity slug + index (e.g. `{slug}-tip-0`)
  - `description` — text field
- Add `ActivityTip` type (`{ key: string; description: string }`) to `packages/types/index.ts` and add `tips?: ActivityTip[]` to the `Activity` type
- Add `tips` to the GROQ projection in `packages/core/src/recommendations/sanity-source.ts` so tips are included in API responses
- Render tips on the activity detail screen (`apps/mobile/app/(authed)/activities/[slug].tsx`) below the description section. Each tip should display as:
  - Rounded-corner card with a pale orange-brown background
  - `Lightbulb` icon (already in `apps/mobile/lib/icons.ts`) on the left
  - Text with **"Tip:"** in bold followed by the description
  - Only render the section if the activity has tips
- Deploy the updated Sanity schema

## Notes

- `Lightbulb` is already imported from `lucide-react-native` in `apps/mobile/lib/icons.ts` — import it directly from there or from `lucide-react-native`
- The max-3 cap should be enforced via Sanity schema validation (`Rule.max(3)`)
- Tip keys are for CMS identification only and do not need to be shown in the UI
- The GROQ query lives in `packages/core/src/recommendations/sanity-source.ts` — the mobile app fetches from a backend API, not directly from Sanity
