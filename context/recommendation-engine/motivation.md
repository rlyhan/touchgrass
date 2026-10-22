## Motivation

Motivation produces each activity's **motivation boost**, which is added to the personality base score to give the final score (`final = base + boost`). It rewards activities whose types match what the user said they want from a hobby.

Code: [`packages/core/src/lib/recommendations/motivation/`](../../packages/core/src/lib/recommendations/motivation/), with a `.test.ts` next to each file.

- **Affects:** the final score, so both the order of the recommendations screen and which activities land in `recommendedSlugs`.
- **Depends on:** personality — the boost is built from the user's pattern weights (see [Personality](personality.md)).
- **Never affected by:** interests.

---

## Inputs

The user selects at least one motivation during onboarding. Each motivation maps to a fixed set of activity types (`MOTIVATION_OPTIONS`), and no type belongs to more than one motivation:

| Motivation | Associated activity types |
|---|---|
| `explore_creative` | Creative, Artistic, Constructive, Expressive, Performative |
| `learn_think_grow` | Intellectual, Analytical, Educational, Reflective |
| `challenge_push_myself` | Active, Physical, Skill-based, Competitive |
| `seek_adventure` | Adventurous, Outdoorsy, Exploratory, Experimental |
| `connect_with_people` | Social, Collaborative, Leadership, Community-oriented |
| `grow_and_achieve` | Professional, Goal-oriented, Disciplined, Strategic |
| `improve_wellbeing` | Mindful, Therapeutic, Emotional |

---

## How it works

### 1. Shared patterns — `boost.ts`

1. Pool the associated types of every selected motivation (duplicates removed).
2. Keep the activity's `type` and `related_types` that appear in that pool.
3. The **shared patterns** are the patterns of those matching types (`ACTIVITY_TYPE_PATTERNS`), duplicates removed.

Done by `getMotivationAndActivitySharedPatterns`.

### 2. Adjacency — `adjacency.ts`

Each pattern's neighbours are the other three patterns in its group. A neighbour that differs on one trait level is distance 1 (weight `0.65`); one that differs on both is distance 2 (weight `0.5`). Done by `calculatePatternDistance` and `getAdjacentPatterns`, using `MATCH_WEIGHTS`.

### 3. Boost — `boost.ts`

For each shared pattern, add:

- the user's weight for it × `1.0`
- each distance-1 neighbour's weight × `0.65`
- the distance-2 neighbour's weight × `0.5`

Then divide the total by `normalizationFactor` (default `5`). Done by `calculateMotivationBoost`.

---

## Scale reference

| Value | Meaning |
|---|---|
| 0 | No activity type matches any selected motivation |
| ≈ 0.28 | A neutral user's boost per shared pattern (`0.5 × (1 + 0.65 × 2 + 0.5) / 5`) |
| ≈ 0.84 | A neutral user's boost for one fully matching type (3 shared patterns) |
| ≈ 0.4–0.9 | Typical spread of a real user's personality base scores, for comparison |

---

## Edge cases

- **Matching is by activity type, not by pattern.** Analytical and Creative both include `9-HH`, but an Analytical activity gets no boost from `explore_creative` because none of its types are creative types. (`boost.test.ts`)
- **No matching type means a boost of 0**, so the final score equals the base score. (`boost.test.ts`)
- **The boost adds up across motivations instead of averaging.** Each extra motivation can only add shared patterns, so users who select more motivations get higher final scores across the board. This is why `recommendedSlugs` uses a cutoff relative to each user rather than a fixed score. (`boost.test.ts`, `factor-contracts.test.ts`)
- **Selecting the same motivation twice changes nothing**, because types and shared patterns are deduplicated. (`boost.test.ts`)
- **Every pattern weight contributes; there's no threshold.** A weak exact match still adds, and a strong neighbour can lift a weak target via adjacency. (`boost.test.ts`)
- **The boost usually outweighs personality.** One matching type gives a neutral user about +0.84, more than the typical spread of base scores, so a strong personality fit with no matching type typically ranks below a weaker fit that matches a motivation. (`factor-contracts.test.ts`)
