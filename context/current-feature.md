# Activity editor field improvements

## Summary

Description:
- Needs to be a rich text field.
- Mock data for the description field is just text --- but should be converted into a single line paragraph in Sanity.

Type:
- Needs instructional text: "What best describes this activity's purpose?"
- Alphabetically ordered.
- Must have validation error if empty.

Field:
- Alphabetically ordered.
- Must have validation error if empty.

Related types:
- Needs instructional text: "What other purposes can this activity be described as?"
- Must be presented as a multi-select dropdown select menu, where currently selected options in the dropdown display as a tick next to its label.
- Selected options are displayed below the dropdown, each removable with an 'x' button.
- Must not be able to select the option that is already selected for the primary Type.
- Alphabetically ordered.
- Must have validation error if empty.

Pattern types:
- We need to remove this field for now. The original mock data never had this as a field, pattern types were automatically generated through an algorithm, and we should keep this separation.

## Parent Branch

feat/add-sanity

## Requirements

### Description field
- Sanity schema: rich text (Portable Text array of `block`), constrained to paragraph style with bold + italic decorators only (no headings, lists, or links).
- `Activity.description` typed as `PortableTextBlock[] | undefined` end-to-end.
- Mobile renders blocks via a shared `PortableText` component (paragraph per block, span-level bold/italic).
- Mock data: any plain-text description must be migrated to a single-paragraph Portable Text block when seeded into Sanity. Existing mocks have no description and require no migration.

### Type field
- Add instructional text near the Type field label in the Activity editor: "What best describes this activity's purpose?"
- Options must be alphabetically ordered.
- Required: show validation error when empty.

### Field field
- Options must be alphabetically ordered.
- Required: show validation error when empty.

### Related types field
- Add instructional text near the Related types field label: "What other purposes can this activity be described as?"
- Present as a multi-select dropdown menu.
- Currently selected options inside the dropdown list display a tick next to their label.
- Selected options are rendered below the dropdown as chips, each with an 'x' button to remove it.
- The option currently selected as the primary Type must not be selectable in Related types.
- Options must be alphabetically ordered.
- Required: show validation error when empty (at least one entry).

### Pattern types field
- Remove from the Activity schema. Pattern types are derived by the recommendation algorithm from Type + Related types and should not be authored content.

## Notes
