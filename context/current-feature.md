# Current Feature

## Edit preferences

Branch: `feature/edit-preferences` (from `qa`)

Let signed-in users revisit the interests, personality and motivation onboarding steps
(not name or basic details) with their saved answers prefilled, and save the changes.

### Decisions

- `/profile` is a session-scoped singleton resource: `GET /profile` reads it, `PATCH /profile`
  partially updates it. PATCH, not PUT, because only three of the profile's fields change.
- `PATCH /profile` accepts only `interests`, `personality`, `motivations` (strict, at least one).
- Edit flow lives in `app/(authed)/preferences/`, separate from onboarding, whose layout redirects
  users who already have a profile. Step UI is shared between both flows.
- Labels: drawer item "Edit preferences"; final button "Save changes".

### Stages

1. [ ] `GET /profile` in core; mobile `fetchHasProfile` uses it instead of probing `/pattern-weights`.
2. [ ] Drawer link + prefilled 3-step edit flow + `PATCH /profile`; save returns to the tabs.
3. [ ] After save, clear pattern-weight/recommendation caches and refetch recommendations.
