 # Document Action  

## Standard feature documentation

1. Check what the latest committed change is in order to document it. Any uncommitted changes will not be documented.

2. Check whether a new version entry has already been made to `CHANGELOG.md` on this branch. If so, ask whether user wants to add the latest committed change under that entry, or add a new version entry.

2. Update `CHANGELOG.md` following structure provided in @/context/documentation.md.
- If any significant changes made to the stack - ie. any packages intalled, package.json commands, environment updates, make sure to update `CLAUDE.md` and `README.md`.

3. Update `package.json` and lockfile versions using semantic versioning rules.