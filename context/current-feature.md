# Related Types mock data

## Summary

Update the related_types in each of the mock recommendations in packages/mocks/recommendations.ts with zero to a few closely related types.

## Parent Branch
recommendation-engine-v1

## Requirements

- For each entry in `packages/mocks/recommendations.ts`, populate `related_types` with zero to a few `ActivityType` values that are closely related to the recommendation's primary `type`.
- Use only values defined in `ACTIVITY_TYPES` in `packages/types/constants.ts` (the 27 grouped types).
- Do not include the recommendation's own primary `type` in its `related_types` array.
- Pick related types that genuinely fit the recommendation's title and field — not just types from the same group.
- Leave `related_types` as an empty array when no other type is a strong match.
- Keep the rest of each recommendation entry (id, title, imageUrl, type, field, estimated_time) unchanged.

## Notes
