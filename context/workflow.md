## Workflow

This is the standard workflow for every feature, fix, refactor, or infrastructure change.

1. **Branch**
   - Create a new branch from `main` or the parent branch listed in `@context/current-feature.md`.
   - Use descriptive branch names:
     - `feature/[feature-name]`
     - `fix/[fix-name]`
     - `refactor/[refactor-name]`
     - `chore/[task-name]`

2. **Document**
   - Define the feature/fix in `@context/current-feature.md`.
   - Convert requirements into actionable implementation tasks before coding.

3. **Sync**
   - Pull/rebase the latest parent or `main` branch before implementation.

4. **Implement**
   - Implement requirements incrementally.
   - Prefer one commit per meaningful change, especially for large features.
   - Keep commits focused and scoped to a single concern.

5. **Review**
   - Continuously review AI-generated code for:
     - correctness,
     - readability,
     - architectural consistency,
     - unintended side effects,
     - duplication or unnecessary complexity.

6. **Test**
   - Verify functionality manually.
   - Run relevant validation commands (`npm run build`, tests, lint, typecheck, etc).
   - Resolve all errors before merge.

7. **Refine**
   - Refactor or simplify implementation if architectural drift, duplication, or unnecessary complexity emerged during development.

8. **Log**
   - Once the feature/fix is complete and there is no parent branch:
     - Update `CHANGELOG.md` using the documented format
     - Update `package.json` and lockfile versions following semantic versioning rules
     - Clear `@context/current-feature.md`

9. **Merge**
   - Merge into the parent branch or `main`.

10. **Delete Branch**
   - Delete the branch after merge.


## Commits

- Ask before committing (never auto-commit).
- Use conventional commit messages (`feat:`, `fix:`, `refactor:`, `chore:`, etc).
- Keep commits focused and atomic.
- Never include AI attribution in commit messages (e.g. "Generated with Claude").