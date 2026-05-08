# Update activity fields

## Summary

The activity fields are currently too leaned towards creative, hobbyist culture, which biases recommendations towards high Openness users.

We need a more diverse set of activity fields and mock activity data.

We need to update the ActivityField type to handle these:

export const ACTIVITY_FIELDS: ActivityField[] = [
  "Music",
  "Art",
  "Writing",
  "Photography",
  "Film",
  "Theater",
  "Dance",

  "Coding",
  "Technology",
  "Science",
  "Astronomy",
  "Engineering",

  "Cars",
  "Motorcycles",
  "Aviation",

  "Fitness",
  "Sports",
  "Martial Arts",
  "Cycling",
  "Running",
  "Climbing",
  "Hiking",

  "Gaming",
  "Board Games",

  "Cooking",
  "Coffee",
  "Fashion",

  "Travel",
  "Nature",
  "Camping",

  "Psychology",
  "Philosophy",
  "History",
  "Language",

  "Business",
  "Finance",
  "Leadership",

  "Meditation",
  "Wellness",

  "Education",
  "Community",
  "Volunteering",

  "DIY",
  "Home Design",
  "Collecting",
]

And then update the mock data and any logic, types, etc accordingly.

## Parent Branch

## Requirements

- Replace the existing `ACTIVITY_FIELDS` constant and `ActivityField` type with the new expanded list (42 fields across 11 thematic groups)
- Update all mock activity/recommendation data so categories use only values from the new field list
- Update any UI components that render or filter by `ActivityField` (e.g. interest pickers, tags, filter chips) to handle the new count and groupings
- Ensure TypeScript types stay consistent — no string literals hardcoded outside the canonical `ACTIVITY_FIELDS` list
- Run `npm run build` (or lint) to confirm zero type errors after changes

## Notes

- The new list is intentionally broader: it adds STEM, vehicles, fitness sub-disciplines, food/lifestyle, academic/intellectual, business, and community categories to counterbalance the current creative-arts bias
- Fields are grouped thematically (Creative, STEM, Vehicles, Active/Sports, Games, Lifestyle, Outdoors, Academic, Business, Wellness, Community/DIY) — keep this grouping in mind if the UI needs section headers or ordering logic
- Mock data only needs representative coverage across the new fields; it does not need to be exhaustive
- Do not rename or alias old fields — replace them cleanly; any saved user preferences referencing old field names will need a migration or reset if persistence is involved
