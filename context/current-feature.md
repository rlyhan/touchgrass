# Set up Activity content type in Sanity

## Summary

Create a Sanity document schema that maps the `Activity` TypeScript type (plus the `description` field from `ActivityDetail`) to an editorially manageable content type in the Sanity Studio.

## Parent Branch

feat/add-sanity

## Requirements

1. Create `apps/sanity/schemaTypes/activity.ts` with a Sanity `document` schema named `activity` that includes all fields from the `Activity` type in `packages/types/index.ts`, plus the `description` field from `ActivityDetail`:
   - `title` → `string`, required, used as the document title
   - `imageUrl` → `image` type with hotspot enabled
   - `type` → `string` with a fixed list of options matching the `ActivityType` union
   - `field` → `string` with a fixed list of options matching the `ActivityField` union
   - `estimated_time` → `string`
   - `related_types` → array of `string`, each option from `ActivityType`
   - `patternTypes` → array of `string`, each option from `PatternTypeId`
   - `description` → `text` (from `ActivityDetail`, human-authored editorial copy)
   - Do NOT include `aiSummary` — that is user-specific AI-generated content, not authored in Sanity
2. Register the `activity` schema in `apps/sanity/schemaTypes/index.ts` so it appears in the Studio.
3. Do not duplicate the option lists — define them once as exported constants in `activity.ts` and reuse for both single-value and array fields where applicable.

## Implementation

- Created `apps/sanity/schemaTypes/activity.ts` with the `activity` document schema
- Defined `activityTypeOptions`, `activityFieldOptions`, and `patternTypeOptions` as reusable constants
- Registered `activitySchema` in `apps/sanity/schemaTypes/index.ts`

## Notes
