## CHANGELOG.md Updates

Follow this structure for all changelog entries.

Entries should be:
- concise,
- technically informative,
- implementation-aware,
- focused on system or product impact rather than commit history.

Avoid:
- debugging chronology,
- excessive internal implementation detail,
- low-level code narration,
- commit-by-commit summaries.

Prefer:
- architectural intent,
- user/system-facing outcomes,
- important operational or compatibility notes,
- subsystem-scoped summaries when relevant.

Use the following format:

```md
## YYYY-MM-DD — Type: Summary

Short 1–2 sentence overview describing the outcome, capability, fix, or architectural change.

### Area (`path/to/workspace`)

- Concise summary of the change and its purpose.
- Additional implementation detail only if operationally or architecturally important.
- Mention validation, compatibility, migration, performance, accessibility, or infra implications when relevant.

### Area (`path/to/workspace`)

- Additional scoped changes.
```


## Versioning

Follow Semantic Versioning (`MAJOR.MINOR.PATCH`) when updating `package.json` versions.

Increment versions based on the highest-impact change included in the release:

- `PATCH` (`x.x.1`)
  - Bug fixes
  - Small refactors
  - Accessibility improvements
  - UI polish
  - Performance tweaks
  - Internal cleanup
  - Non-breaking dependency or infrastructure updates

Examples:
- Fixing auth/session bugs
- Adjusting recommendation scoring logic
- Accessibility corrections
- Refactoring shared utilities
- Deployment/configuration fixes

- `MINOR` (`x.1.x`)
  - New features
  - New screens/endpoints/workflows
  - Backwards-compatible schema additions
  - Significant UX improvements
  - New integrations or subsystems

Examples:
- Adding activity instructions/tips
- Introducing Sanity CMS integration
- Adding recommendation detail pages
- Adding authentication flows
- Adding Storybook support

- `MAJOR` (`1.x.x`)
  - Breaking API changes
  - Database/schema incompatibilities
  - Large architectural rewrites
  - Removed or fundamentally changed behavior
  - Changes requiring consumer migration

Examples:
- Renaming/removing public API fields
- Replacing auth/session architecture incompatibly
- Reworking routing or data contracts incompatibly
- Database migrations that invalidate previous clients

Guidelines:
- Default to `PATCH` unless a release clearly introduces new functionality.
- Use the highest-impact change in the release to determine the version bump.
- Multiple fixes/features may ship in a single release version.
- Avoid unnecessary major-version inflation during active development.
- Keep changelog entries grouped under the version they shipped with.