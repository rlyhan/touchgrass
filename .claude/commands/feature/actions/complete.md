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

5. Push the branch to origin.

6. Merge:
   - into the parent branch if `## Parent Branch` exists,
   - otherwise into `main`.

7. If merging into `main`:
   - update `CHANGELOG.md`,
   - update `package.json` and lockfile versions using semantic versioning rules,
   - clear `current-feature.md`.

8. If merging into a parent branch:
   - preserve the feature context for continued work.

9. Switch back to the merge target branch.

10. Ask whether the merged branch should be deleted.