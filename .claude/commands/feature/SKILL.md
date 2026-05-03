---
name: feature
description: Manage current feature workflow - start, review, explain or complete
argument-hint: load|start|start-microfeature|review|explain|complete|complete-microfeature
---

# Feature Workflow

Manages the full lifecycle of a feature from spec to merge.

## Working File

@context/current-feature.md

### File Structure

current-feature.md has these sections:

- `## Summary` - Summary of what the feature entails
- `## Requirements` - Bullet points of specific goals the feature must achieve
- `## Notes` - Additional context, constraints, or details from summary

## Task

Execute the requested action: $ARGUMENTS

| Action | Description |
|--------|-------------|
| `load` | Define feature requirements and notes in current-feature.md |
| `load-micro` | Define micro-feature requirements, log parent branch context |
| `start` | Create feature branch and begin implementation |
| `start-micro` | Validate or create parent branch, create child branch, begin implementation |
| `review` | Check goals met, code quality |
| `explain` | Document what changed and why |
| `complete` | Commit, push, merge to main, reset current-feature.md |
| `complete-micro` | Commit, push, merge to parent branch, restore parent feature context |

See [actions/](actions/) for detailed instructions.

If no action provided, explain the available options.