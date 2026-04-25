## Workflow

This is the common workflow that we will use for every single feature/fix:

1. **Document** - Document the current feature in @context/current-feature.md, replacing what was originally there
2. **Branch** - Create new branch for feature, fix, etc
3. **Implement** - Implement the feature/fix that I created in @context/current-feature.md
4. **Test** - Verify it works in the browser. Run `npm run build` and fix any errors
5. **Iterate** - Iterate and change things if needed
6. **Log** If build passes and everything works, update CHANGELOG.md with the completed feature/fix
7. **Commit** - Only after build passes and everything works
8. **Merge** - Merge to master
9. **Delete Branch** - Delete branch after merge
10. **Review** - Review AI-generated code periodically and on demand.

## Branching

We will create a new branch for every feature/fix. Name branch **feature/[feature]** or **fix[fix]**, etc. Ask to delete the branch once merged.

## Commits

- Ask before committing (don't auto-commit)
- Use conventional commit messages (feat:, fix:, chore:, etc.)
- Keep commits focused (one feature/fix per commit)
- Never put "Generated With Claude" in the commit messages