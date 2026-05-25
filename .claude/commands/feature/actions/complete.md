# Complete Action

1. Run a final review:
   - verify all requirements are complete,
   - ensure implementation quality is acceptable.

2. Verify validation commands pass:
   - build,
   - tests,
   - lint,
   - typecheck,
   - any relevant runtime verification.

3. Ask before committing.

4. Stage changes and create focused conventional commits.

5. If `## Parent Branch` exists,
   - push branch to origin
   - merge branch into parent branch
   - checkout parent branch

6. If no parent branch,
   - update `CHANGELOG.md` following structure provided in @/context/documentation.md
   - update `package.json` and lockfile versions using semantic versioning rules,
   - clear `current-feature.md`.
   - push branch to origin