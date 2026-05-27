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

- `getRecommendations` returns the top 3 best-match recommendations (`ScoredRecommendation[]`) after scoring and diversification.
- `getTopActivityTypes` returns the top N (default 6) activity types for the user by pattern affinity (`ScoredActivityType[]`), independent of any specific recommendation list.

---

## Algorithm Flow

Implemented in [`packages/core/src/lib/recommendation-algorithm.ts`](../packages/core/src/lib/recommendation-algorithm.ts), with helpers split across [`packages/core/src/lib/helpers/`](../packages/core/src/lib/helpers/) (`ocean.ts`, `patterns.ts`, `motivation.ts`, `diversify.ts`).

### 1. Convert BFAS → OCEAN

The user submits 10 BFAS aspect scores (0–100). Pattern types are defined against the Big Five (OCEAN), so we collapse each pair of aspects into its parent trait by averaging:

- `Openness = avg(Openness, Intellect)`
- `Conscientiousness = avg(Industriousness, Orderliness)`
- `Extraversion = avg(Enthusiasm, Assertiveness)`
- `Agreeableness = avg(Compassion, Politeness)`
- `Neuroticism = avg(Volatility, Withdrawal)`

Done by `getOCEANScores`.

### 2. Compute the user's pattern strengths

A **pattern type** is a combination of two OCEAN traits at high/low levels (e.g. `1-HH` = high Extraversion + high Agreeableness). There are 10 trait pairs × 4 H/L combinations = 40 pattern types, declared in `PATTERN_TYPES`.

For each pattern, we compute how strongly the user fits it:

- For each of the pattern's two traits, take the user's OCEAN score and convert it to a 0–1 fit:
  - level `H` → `score / 100`
  - level `L` → `1 - score / 100`
- Average the two fits.

Result: `Record<PatternTypeId, number>` where each value is in `[0, 1]`. Done by `calculatePatternStrength` and `getUserPatternWeights`.

### 3. Score each recommendation

Every recommendation has a primary `type` (an `ActivityType`) and optional `related_types`. The map `ACTIVITY_TYPE_PATTERNS` associates each `ActivityType` with the pattern types that best express it (typically 3 per activity type).

For each recommendation:

1. **Primary affinity** — look up `ACTIVITY_TYPE_PATTERNS[recommendation.type]` and average the user's pattern strengths across those pattern IDs.
2. **Secondary affinity** — flatten the pattern IDs from every entry in `related_types` and average the user's strengths across that combined list.
3. **Base score** —
   - if there are no secondary patterns: `base = primary`
   - otherwise: `base = primary + secondary * 0.2`

Primary affinity is the anchor — a strong primary match shouldn't be dragged down just because a recommendation has related types. Secondary affinity adds a modest bonus on top (capped at +0.2), so it can only reinforce, not punish. This means base scores can exceed 1.0 in theory (ceiling 1.2), but that's fine — all scores are relative for ranking.

Done by `calculateRecommendationBaseScore` in `recommendation-algorithm.ts`.

### 4. Apply motivation boost

Each motivation has a set of `associated_activity_types`. The boost rewards activities whose type/related_types overlap with the user's selected motivations.

1. Find the **shared patterns** — the union of pattern IDs from any activity type that appears in both the recommendation's type/related_types and the motivation's associated types.
2. For each shared target pattern, accumulate:
   - `userWeight[target] × 1.0` (exact match)
   - `userWeight[adjacent] × 0.65` for each distance-1 neighbour in the same pattern group (strong adjacent)
   - `userWeight[adjacent] × 0.5` for each distance-2 neighbour (weak adjacent)
3. **Motivation boost** = sum / `normalizationFactor` (default 5), keeping it modest relative to the base score.
4. **Final score** = `base + motivationBoost`

The adjacent-pattern step means a user who fits a neighbouring pattern still benefits even if they don't perfectly match the target, weighted proportionally by their actual pattern weight. Done by `calculateMotivationBoost` and helpers `getMotivationAndActivitySharedPatterns` / `getAdjacentPatterns` in `helpers/motivation.ts` and `helpers/patterns.ts`.

### 5. Diversify and order

After scoring, `diversifyAndOrder` (in `helpers/diversify.ts`) produces the final ordered list before the top 10 (`MAX_RECOMMENDATIONS`) are taken.

**Bucket classification** — each recommendation is placed into one of three buckets based on score and whether its `field` is one of the user's interests:

| Condition | Bucket | sortScore |
|-----------|--------|-----------|
| score ≥ 0.6 AND field in interests | top | score |
| score ≥ 0.6 AND field not in interests | middle | score |
| score in [0.4, 0.6) AND field in interests | middle | score + 0.1 |
| everything else | bottom | score |

The +0.1 boost is applied only to `sortScore` (used for ordering) — the original `score` is preserved.

**Two-pass slot filling:**

- **Pass 1 — Interest diversification** (runs when the user has ≥ 1 interest): for each user interest (in input order), pick the highest-`sortScore` Top-bucket recommendation whose `field` matches. Records each chosen activity type for Pass 2.
- **Pass 2 — Activity-type diversification** (always runs): walk the remaining high-sortScore pool (Top ∪ Middle with `sortScore ≥ 0.6`) and pick the first recommendation for each previously-unseen activity type.

Remaining recommendations are appended in bucket order (Top → Middle → Bottom), sorted by `sortScore` descending within each bucket. The final list is stripped back to `ScoredRecommendation[]` (bucket metadata discarded).

---

## Core Principles

- prioritise realistic actions
- avoid overwhelming users
- maintain diversity of suggestions
- favour low-friction options by default

---

## Future Evolution

We will add more inputs later in the future.