# Start Subfeature Action

1. Read current-feature.md - verify Requirements are populated
2. If empty, error: "Run /feature load-sub first"
3. Identify the current branch and ask: `Would you like to use {current-branch} as your parent branch?`
   - 'Yes' - SKIP to Step 6 if so
   - 'Create new parent branch from main'
4. Ask for the parent branch name, then create and checkout that branch
5. Populate ## Parent Branch in current-feature.md with the confirmed parent branch name
6. Create and switch to new branch: `{subfeature-name}` based on a derived name from the current-feature.md H1, otherwise ask for a subfeature name and suggest a branch name before doing so
7. List the requirements, then implement them one by one