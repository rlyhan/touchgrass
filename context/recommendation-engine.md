## Recommendation Engine Overview

The recommendation engine is responsible for generating personalised activity suggestions based on user input.

- During onboarding, users will provide scores for personality traits from the BFAS (Big Five Aspects Scale) model.
- BFAS scores are used to compute the user's match to the different pattern types of the IPIP-NEO-120 (International Personality Item Pool – Neuroticism, Extraversion, Openness – 120 item version) model.
- The scores for each BFAS type will be factored together with at least one motivation provided by the user in order to filter/rank the recommendations for a better match.
- If interests are provided, this will also be factored in to support better filtering/ranking.

## Big Five Aspects Scale

There are 10 traits in the Big Five Aspects Scale, belonging under primary categories (Openness to Experience, Conscientiousness, Extraversion, Agreeableness, Neuroticism) which are:

Openness to Experience
- Openness
- Intellect
Conscientiousness
- Industriousness
- Orderliness
Extraversion
- Enthusiasm
- Assertiveness
Agreeableness
- Compassion
- Politeness
Neuroticism
- Volatility
- Withdrawal

## International Personality Item Pool – Neuroticism, Extraversion, Openness

Each pattern type belongs to a group that intersects two OCEAN traits, with a high or low for each.

# Pattern Group 1: Extraversion × Agreeableness
- Personable (high E, high A)
- Assertive-Influencer (high E, low A)
- Harmonious-Cooperative (low E, high A)
- Independent-Distant (low E, low A)

# Pattern Group 2: Extraversion × Conscientiousness
- Enterprising (high E, high C)
- Spontaneous-Impulsive (high E, low C)
- Diligent-Industrious (low E, high C)
- Peaceful Explorer (low E, low C)

# Pattern Group 3: Extraversion × Neuroticism
- Expressive-Energetic (high E, high N)
- Socially Self-Confident (high E, low N)
- Reflective Resilient (low E, high N)
- Contented (low E, low N)

# Pattern Group 4: Extraversion × Openness
- Enchanting Visionary (high E, high O)
- Bold Expressive (high E, low O)
- Intellectual Explorer (low E, high O)
- Steady Traditionalist (low E, low O)

# Pattern Group 5: Agreeableness × Conscientiousness
- Compromising (high A, high C)
- Social Harmonizer (high A, low C)
- Principled Leader (low A, high C)
- Independent Nonconformist (low A, low C)

# Pattern Group 6: Agreeableness × Neuroticism
- Passionate Empath (high A, high N)
- Pleasant (high A, low N)
- Emotionally Dynamic (low A, high N)
- Stable Realist (low A, low N)

# Pattern Group 7: Agreeableness × Openness
- Tolerant (high A, high O)
- Amiable Conformist (high A, low O)
- Independent Innovator (low A, high O)
- Resolute Practical (low A, low O)

# Pattern Group 8: Conscientiousness × Neuroticism
- Meticulous Visionary (high C, high N)
- Persistent (high C, low N)
- Creative Nonconformist (low C, high N)
- Easygoing Optimist (low C, low N)

# Pattern Group 9: Conscientiousness × Openness
- Enlightened Traditionalist (high C, high O)
- Conventional (high C, low O)
- Innovative Idealist (low C, high O)
- Spontaneous Adventurer (low C, low O)

# Pattern Group 10: Neuroticism × Openness
- Sensitive (high N, high O)
- Traditionalist (high N, low O)
- Clear-Thinking (low N, high O)
- Grounded Realist (low N, low O)

---

## Inputs

- Personality traits
- Motivation
- Interests (optional)

---

## Outputs

- 3 recommendations that are the best match based on an algorithm that checks against scores from personality inputs

---

## Algorithm Flow

Implemented in [`packages/core/src/lib/recommendation-algorithm.ts`](../packages/core/src/lib/recommendation-algorithm.ts), with helpers in [`packages/core/src/lib/helpers.ts`](../packages/core/src/lib/helpers.ts).

### 1. Convert BFAS → OCEAN

The user submits 10 BFAS aspect scores (0–100). Pattern types are defined against the Big Five (OCEAN), so we collapse each pair of aspects into its parent trait by averaging:

- `Openness = avg(Openness, Intellect)`
- `Conscientiousness = avg(Industriousness, Orderliness)`
- `Extraversion = avg(Enthusiasm, Assertiveness)`
- `Agreeableness = avg(Compassion, Politeness)`
- `Neuroticism = avg(Volatility, Withdrawal)`

Done by `getOCEANScores`.

### 2. Compute the user's pattern strengths

A **pattern type** is a combination of two OCEAN traits at high/low levels (e.g. `1-HH` = high Extraversion + high Agreeableness). There are 10 trait pairs × 4 H/L combinations = 40 pattern types, declared in `patternTypes`.

For each pattern, we compute how strongly the user fits it:

- For each of the pattern's two traits, take the user's OCEAN score and convert it to a 0–1 fit:
  - level `H` → `score / 100`
  - level `L` → `1 - score / 100`
- Average the two fits.

Result: `Record<PatternTypeId, number>` where each value is in `[0, 1]`. Done by `calculatePatternStrength` and `getUserPatternWeights`.

### 3. Score each recommendation

Every recommendation has a primary `type` (an `ActivityType`) and optional `related_types`. The map `ActivityTypePatterns` associates each `ActivityType` with the pattern types that best express it (typically 3 per activity type).

For each recommendation:

1. **Primary affinity** — look up `ActivityTypePatterns[recommendation.type]` and average the user's pattern strengths across those pattern IDs.
2. **Secondary affinity** — flatten the pattern IDs from every entry in `related_types` and average the user's strengths across that combined list.
3. **Final score** —
   - if there are no secondary patterns: `final = primary`
   - otherwise: `final = primary * 0.7 + secondary * 0.3`

The primary type is weighted more heavily (0.7) because it's the dominant lens the activity is framed through; related types are influence, not equal voice. The empty-list fallback prevents an absent `related_types` field from dragging the score toward zero.

Done by `calculateActivityPatternAffinity` and the main loop in `getRecommendations`.

### 4. Sort and return

Recommendations are sorted highest → lowest by `score` and the top 3 (`MAX_RECOMMENDATIONS`) are returned as `ScoredRecommendation[]`. The API route unwraps these to `Recommendation[]` for the response.

### Inputs not yet wired in

- **Motivation** — declared in the user profile but not yet factored into scoring.
- **Interests** — same.
- **Human-curated `patternTypes`** on each recommendation — the field exists but the algorithm currently only reads from `ActivityTypePatterns` via `type` / `related_types`.

---

## Core Principles

- prioritise realistic actions
- avoid overwhelming users
- maintain diversity of suggestions
- favour low-friction options by default

---

## Future Evolution

We will add more inputs later in the future.