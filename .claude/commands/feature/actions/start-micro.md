# Start Microfeature Action

1. Read current-feature.md - verify Requirements are populated
2. If empty, error: "Run /feature load-micro first"
3. Identify the current branch and ask: `Would you like to use {current-branch} as your parent branch?`
   - 'Yes'
   - 'Create new parent branch from main'
4. If 'Create new parent branch from main', ask for the parent branch name, then create and checkout that branch
5. Populate ## Parent Branch in current-feature.md with the confirmed parent branch name
6. Ask for the micro-feature name if not already in current-feature.md H1
7. Create and switch to new branch: `{parent-branch}/{micro-feature-name}`
8. List the requirements, then implement them one by one