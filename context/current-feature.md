# Onboarding Phase 1 - UI

## Summary

The onboarding phase of the app where users will enter their details. These details will determine what recommendations will appear to them.

- Screen 1: Name
- Screen 2: Basic details
- Screen 3: Interests
- Screen 4: Personality
- Screen 5: Why are you looking for a new hobby/activity?

## Requirements

We need these fields per screen:
- Screen 1: Name field - mandatory
- Screen 2: Birthdate, Height, Gender, Build (eg. slim), Current Location, Are you working or studying? (Student / Employed / Unemployed / Retired) - all mandatory
- Screen 3: Multiple selections of Interests (all optional, minimum 0, chosen from the keys in ActivityField in lib/types.ts) - include visible Skip button at the bottom of the screen.
- Screen 4: A 0-100 slider for each of the Big Five personality traits (PersonalityType in lib/types.ts) - Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism. All sliders default to 50 (neutral) and are optional. Show short helper text under each trait label explaining the trait, plus low/high anchor labels under the slider track. Include a visible Skip button at the bottom of the screen that leaves all sliders at their defaults.
- Screen 5: Multiple selections (all optional, minimum 1) - "Something fun and easy to do", "A new challenge / goal I can set for myself", "Learn some new skills", "Meet new people", "Self-improvement / well-being"

Headings per screen:
- Screen 1: What's your name?
- Screen 2: Tell us some basic info about yourself.
- Screen 3: Pick a few things you're interested in. (Subtitle: Don't worry if you can't think of anything right now.)
- Screen 4: How would you describe your personality? (Subtitle: Don't worry if you can't think of anything right now.)
- Screen 5: Why are you looking for a new hobby/activity?

## Notes
- `RecommendationType` has been renamed to `ActivityType` in `lib/types.ts` since it describes the kind of activity a recommendation belongs to (Constructive, Active, Artistic, …), not a personality trait. Personality is now modelled separately as `PersonalityType` (Big Five / OCEAN).
- `PersonalityType` keys are `Openness | Conscientiousness | Extraversion | Agreeableness | Neuroticism`. Per-trait labels and helper text live in `PERSONALITY_TRAITS`; default scores in `DEFAULT_PERSONALITY_SCORES`.
- The Big Five sliders use `@react-native-community/slider`.
