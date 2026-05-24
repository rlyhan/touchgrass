# Start Action

1. Open `@context/current-feature.md`

2. Verify:
   - feature name exists,
   - requirements are populated.

3. If requirements are missing:
   - stop and instruct the user to run `/feature load`.

4. Determine the parent branch:
   - use `## Parent Branch` if populated,
   - otherwise use `main`.

5. Sync the parent branch with remote changes.

6. Create and checkout the feature branch:
   - derive the branch name from the feature name,
   - use naming conventions:
     - `feature/...`
     - `fix/...`
     - `refactor/...`
     - `chore/...`

7. List the requirements before implementation begins.

8. Implement requirements incrementally:
   - keep commits focused,
   - prefer one meaningful change per commit,
   - do not auto-commit without asking.