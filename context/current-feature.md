# Onboarding Phase 2 - Form Submission

## Summary

Wire up form state, validation, and submission for the onboarding flow. On submit, show a loading screen that stands in for the (future) recommendation algorithm.

## Requirements

Use React Hook Form to manage onboarding form state and validation across all five screens.

### Mandatory fields
- Screen 1: Name
- Screen 2: Birthdate, Height, Gender, Build, Current Location, Working/Studying status
- Screen 4: All five Big Five personality scores (defaulted to 50, so always satisfied unless explicitly cleared)
- Screen 5: At least one selection from `MOTIVATION_OPTIONS`

Screen 3 (Interests) remains fully optional.

### Loading screen
On submission, show a loading screen while the (future) recommendation algorithm runs. For now:
- Add a 2 second delay in lieu of the algorithm.
- Show a spinner animation.
- Display the message: "Let's see what your next thing could be!"

After the delay, navigate the user to the recommendations view.
