## Recommendation Engine Overview

The recommendation engine is responsible for generating personalised activity suggestions based on user input.

- During onboarding, users will provide scores for personality traits from the BFAS (Big Five Aspects Scale) model.
- BFAS scores are used to compute the user's match to the different pattern types of the IPIP-NEO-120 (International Personality Item Pool – Neuroticism, Extraversion, Openness – 120 item version) model.
- The scores for each BFAS type will be factored together with at least one motivation provided by the user in order to filter/rank the recommendations for a better match.
- If interests are provided, this will also be factored in to support better filtering/ranking.

## Factors

Each factor has its own doc covering what it affects, what it never affects, and its edge cases:

- [Personality](recommendation-engine/personality.md) — BFAS → OCEAN → pattern weights → base score (steps 1–3 below)

---

## Inputs

- Personality traits
- Motivation
- Interests (optional)

---

## Outputs

- `getRecommendations` returns the top 3 best-match recommendations (`ScoredRecommendation[]`) after scoring and diversification.
- It also returns `recommendedSlugs`, which browse labels "Recommended for you": every activity whose final score (step 4, base + motivation boost) is at least half a standard deviation above the user's mean score across the catalogue, without diversification. The cutoff is relative to each user because the motivation boost grows with the number of motivations selected, so absolute final scores aren't comparable across users.
- `getTopActivityTypes` returns the top N (default 6) activity types for the user by pattern affinity — see [Personality](recommendation-engine/personality.md).

---

## Algorithm Flow

Implemented in [`packages/core/src/lib/recommendation-algorithm.ts`](../packages/core/src/lib/recommendation-algorithm.ts). Personality lives in [`packages/core/src/lib/recommendations/personality/`](../packages/core/src/lib/recommendations/personality/); motivation and diversification helpers are still in [`packages/core/src/lib/helpers/`](../packages/core/src/lib/helpers/) (`patterns.ts`, `motivation.ts`, `diversify.ts`).

### 1–3. Personality → base score

BFAS scores are converted to OCEAN, then to a weight for each of the 40 pattern types, then to a base score per activity (`primary + secondary × 0.2`). See [Personality](recommendation-engine/personality.md) for the full method, scale reference and edge cases.

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

## Activity Type Definitions

Strict definitions for the individual `associated_activity_types` configured within the `MOTIVATION_OPTIONS` array.

### Creative / Expressive Sub-types
- **Creative**: Actively bringing something new into existence by combining ideas, materials, or forms in a novel way.
- **Artistic**: Engaging in aesthetic creation or interpretation, focusing on beauty, design, and emotional resonance.
- **Constructive**: Building, assembling, or fabricating physical or digital structures through organized planning and execution.
- **Expressive**: Communicating internal thoughts, feelings, or identities outwardly through a chosen medium.
- **Performative**: Executing actions, movements, or speech live before an audience or within a designated display space.

### Intellectual / Reflective Sub-types
- **Intellectual**: Engaging the mind in complex thought, abstract conceptualization, and the pursuit of deep understanding.
- **Analytical**: Breaking down complex information, systems, or data into smaller parts to understand their mechanics and logic.
- **Educational**: Participating in structured or unstructured learning to acquire specific factual knowledge or technical skills.
- **Reflective**: Turning thought inward to evaluate personal experiences, beliefs, behaviors, and inner states.

### Active / Competitive Sub-types
- **Active**: Requiring physical movement, kinetic engagement, or the expenditure of bodily energy.
- **Physical**: Focusing directly on the mechanics, capabilities, conditioning, and limits of the human body.
- **Skill-based**: Requiring specialized coordination, training, and deliberate practice to achieve technical proficiency.
- **Competitive**: Measuring performance against an opponent, a scoring standard, or a personal record to determine success.

### Exploratory / Adventurous Sub-types
- **Adventurous**: Stepping past the familiar to embrace uncertainty, raw experiences, and spontaneous risk.
- **Outdoorsy**: Engaging with natural, open-air, or non-urban environments that require adaptation to natural elements.
- **Exploratory**: Mapping uncharted territory, observing environments, and gathering baseline findings without a fixed hypothesis.
- **Experimental**: Testing specific variables or trial actions in a controlled way to observe concrete cause-and-effect outcomes.

### Social / Community Sub-types
- **Social**: Interacting directly with others to enjoy companionship, conversation, and mutual presence.
- **Collaborative**: Working jointly with a team or partner to co-create, problem-solve, or achieve a shared outcome.
- **Leadership**: Guiding, motivating, or organizing a group of people toward a specific direction or collective goal.
- **Community-oriented**: Contributing to the welfare, identity, and shared success of a specific local or cultural group.

### Professional / Goal-oriented Sub-types
- **Professional**: Aligning actions with career advancement, industry standards, or formal workplace development.
- **Goal-oriented**: Organizing actions strictly around achieving a clear, measurable, and predefined end state.
- **Disciplined**: Maintaining consistent, controlled behavior and adherence to a rigorous routine despite distractions.
- **Strategic**: Planning and executing actions based on long-term foresight, resource management, and competitive advantage.

### Emotional / Therapeutic Sub-types
- **Mindful**: Maintaining deliberate, non-judgmental presence and acute awareness of the current moment.
- **Therapeutic**: Engaging in actions specifically designed to heal, restore, or remediate psychological or physical strain.
- **Emotional**: Process-driven engagement that focuses on identifying, experiencing, and healthily channeling feelings.

---

## Future Evolution

We will add more inputs later in the future.