## Recommendation Engine Overview

The recommendation engine is responsible for generating personalised activity suggestions based on user input.

- There will be an algorithm that calculates scores for personality traits. In the initial model, it will approximate scores for traits from the BFAS (Big Five Aspects Scale) model, based on the user's input for the Big Five Personality Type inputs in the onboarding form. Based on these scores, the engine will filter what activities can be recommended to the user.
- The scores for each BFAS type will be factored together with at least one motivation provided by the user in order to rank the recommendations.
- If interests are provided, this will also be factored in, in order to further rank the provided recommendations.

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

---

## Inputs

- Personality traits
- Motivation
- Interests (optional)

---

## Outputs

- 3 recommendations that are the best match based on an algorithm that checks against scores from personality inputs

---

## Core Principles

- prioritise realistic actions
- avoid overwhelming users
- maintain diversity of suggestions
- favour low-friction options by default

---

## Future Evolution

We will add more inputs later in the future.