## Personality

Personality produces each activity's **base score**: how well the activity's types fit the user's personality. It is the only factor that applies to every activity, and the starting point the motivation boost is added to (see [`recommendation-engine.md`](../recommendation-engine.md)).

Code: [`packages/core/src/lib/recommendations/personality/`](../../packages/core/src/lib/recommendations/personality/), with a `.test.ts` next to each file.

- **Affects:** every activity's base score, the "You were matched because…" pattern, `getTopActivityTypes`.
- **Never affected by:** motivations or interests.

---

## Inputs

The user submits 10 BFAS (Big Five Aspects Scale) aspect scores, 0–100, grouped under five OCEAN traits:

| OCEAN trait | BFAS aspects |
|---|---|
| Openness to Experience | Openness, Intellect |
| Conscientiousness | Industriousness, Orderliness |
| Extraversion | Enthusiasm, Assertiveness |
| Agreeableness | Compassion, Politeness |
| Neuroticism | Volatility, Withdrawal |

---

## IPIP-NEO pattern types

Each pattern type belongs to a group that intersects two OCEAN traits, with a high or low for each. There are 10 groups × 4 H/L combinations = 40 pattern types, declared in `PATTERN_TYPES`.

| Group | Traits | HH | HL | LH | LL |
|---|---|---|---|---|---|
| 1 | Extraversion × Agreeableness | Personable | Assertive-Influencer | Harmonious-Cooperative | Independent-Distant |
| 2 | Extraversion × Conscientiousness | Enterprising | Spontaneous-Impulsive | Diligent-Industrious | Peaceful Explorer |
| 3 | Extraversion × Neuroticism | Expressive-Energetic | Socially Self-Confident | Reflective Resilient | Contented |
| 4 | Extraversion × Openness | Enchanting Visionary | Bold Expressive | Intellectual Explorer | Steady Traditionalist |
| 5 | Agreeableness × Conscientiousness | Compromising | Social Harmonizer | Principled Leader | Independent Nonconformist |
| 6 | Agreeableness × Neuroticism | Passionate Empath | Pleasant | Emotionally Dynamic | Stable Realist |
| 7 | Agreeableness × Openness | Tolerant | Amiable Conformist | Independent Innovator | Resolute Practical |
| 8 | Conscientiousness × Neuroticism | Meticulous Visionary | Persistent | Creative Nonconformist | Easygoing Optimist |
| 9 | Conscientiousness × Openness | Enlightened Traditionalist | Conventional | Innovative Idealist | Spontaneous Adventurer |
| 10 | Neuroticism × Openness | Sensitive | Traditionalist | Clear-Thinking | Grounded Realist |

---

## How it works

### 1. BFAS → OCEAN — `ocean.ts`

Each pair of aspects is averaged into its parent trait (e.g. `Openness = avg(Openness, Intellect)`). Groupings come from `BFAS_TRAITS[n].parent`. Done by `getOCEANScores`.

### 2. Pattern weights — `patterns.ts`

For each of the 40 patterns, each of its two traits is converted to a 0–1 fit (`H` → `score / 100`, `L` → `1 - score / 100`) and the two fits are averaged. Result: `Record<PatternTypeId, number>`, each in `[0, 1]`. Done by `calculatePatternStrength` and `getUserPatternWeights`.

### 3. Base score — `base-score.ts`

`ACTIVITY_TYPE_PATTERNS` maps each `ActivityType` to the patterns that best express it (typically 3).

1. **Primary affinity** — average the user's weights across the patterns of the activity's `type`.
2. **Secondary affinity** — pool the patterns of every entry in `related_types` into one list and average across it.
3. **Base score** — `primary` if there are no related types, otherwise `primary + secondary × 0.2`.

Primary affinity is the anchor; secondary affinity can only add a bonus (up to +0.2). Done by `calculateRecommendationBaseScore` (via `calculateActivityPatternAffinity`).

### Also built on personality

- **Dominant pattern** — `getDominantPatternId` (in `@touchgrass/types/dominant-pattern`, shared with mobile) picks the user's highest-weighted pattern among an activity's primary + related patterns for the "You were matched because you scored highly as a …" copy. It returns `null` below `MIN_DOMINANT_WEIGHT = 0.6` so the copy never overclaims.
- **Top activity types** — `getTopActivityTypes` (`top-activity-types.ts`) ranks all activity types by primary affinity alone and returns the top N (default 6). Not currently used by the app.

---

## Scale reference

| Value | Meaning |
|---|---|
| 0.5 | A neutral user's weight for every pattern (50 on every trait) |
| 0.6 | "Scored highly" for a single pattern (`MIN_DOMINANT_WEIGHT`) |
| 0.6 | A neutral user's base score for any activity with related types (0.5 + 0.5 × 0.2) |
| 0.72 | Base score of a user who scores highly (0.6) on every relevant pattern |
| 0–1.2 | Arithmetic range of the base score |

---

## Edge cases

- **Neutral users score 0.6, not 0.5.** All catalogue activities have related types, so the secondary bonus lifts a neutral user's base to 0.6. A base of 0.6 means average, not well-matched. (`base-score.test.ts`)
- **The 0–1.2 range is arithmetic only.** A real user can't reach every pattern's ceiling or floor at once because some patterns need opposite levels of the same trait (e.g. `9-HH` vs `9-LH`). (`base-score.test.ts`)
- **Missing pattern weights count as 0**, and an empty pattern list gives an affinity of 0. (`patterns.test.ts`, `base-score.test.ts`)
- **Related types are pooled, not averaged per type.** More related types means each one counts for less. (`base-score.test.ts`)
- **A pattern shared by several related types counts once per type.** Creative and Artistic both include `4-HH`, so with both as related types `4-HH` is weighted twice in the secondary pool. `getDominantPatternId` deduplicates; the base score doesn't. (`base-score.test.ts`, `dominant-pattern.test.ts`)
- **The same pattern can belong to unrelated types** (e.g. `9-HH` is in both Creative and Analytical). This matters for motivations, which match by type, not pattern. (`motivation/boost.test.ts`)
- **Personality alone doesn't earn the browse label.** An activity with a strong base score but no motivation boost usually falls below the user's `recommendedSlugs` cutoff (covered in `factor-contracts.test.ts`).
