# Current Feature

## Bottom nav

Parent branch: `qa`

A bottom nav bar for signed-in users: a centred row of ~56pt square cells, each holding a 24px icon.

- **Home** (`Home` icon) → `/recommendations`
- **Browse** (`Search` icon) → `/browse` (now behind the auth gate)
- **Menu** (`Menu` icon) → opens a right-side drawer showing the user's name and a Log out action

The nav is hidden on the activity detail page. The active tab is filled `green-800` with a white icon. Tab presses give a light haptic.

### Tasks

1. `feat:` Tabs layout under `(authed)/(tabs)` with a custom `BottomNav` tab bar (Home, Browse)
2. `feat:` Menu cell + `MenuDrawer` with the user's name and log out
3. `refactor:` Remove `AuthButton` from page footers and the recommendations error state
