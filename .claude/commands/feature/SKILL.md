---
name: feature
description: Manage the feature workflow from specification to merge
argument-hint: load|start|review|explain|complete
---

# Feature Workflow

Manages the full lifecycle of a feature, fix, refactor, or infrastructure task.

## Working File

@context/current-feature.md

## File Structure

`current-feature.md` contains:

- `# Feature Name` — Human-readable feature/fix title
- `## Parent Branch` — Optional parent branch for stacked feature development
- `## Summary` — Overview of the feature/fix
- `## Requirements` — Specific implementation goals
- `## Notes` — Additional context, constraints, or architectural notes

## Actions

| Action | Description |
|---|---|
| `load` | Define or update the current feature requirements |
| `start` | Create/switch to the feature branch and begin implementation |
| `review` | Review implementation quality and requirement completion |
| `explain` | Summarize what changed and why |
| `complete` | Finalize, merge, version, changelog, and reset workflow state |

See `actions/` for detailed action instructions.

If no action is provided, explain the available actions.