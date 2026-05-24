## Touchgrass - what is it?

A mobile application designed to help people who feel stuck, bored, or stagnant in life discover meaningful, realistic activities/hobbies they can try next.

Instead of overwhelming users with random hobbies that they will never do, the app focuses on personalised, identity-aligned suggestions based on who the user is and what they are capable of doing right now.

The core idea is: Help users who are thinking "I want to try something new, but I don't know what to choose" to become decisive and say "I am going to do this because I am feeling this way and it is realistic for me".

## Core Features

### Profile

The onboarding flow collects the following user data (see [`apps/mobile/app/onboarding/`](../apps/mobile/app/onboarding/) and the `profiles` table in [`packages/core/src/db/schema.ts`](../packages/core/src/db/schema.ts)):

- Name
- Birthdate
- Height (cm)
- Gender — `Male`, `Female`, `Non-binary`, `Prefer not to say`
- Build — `Slim`, `Athletic`, `Average`, `Heavy`
- Location — free-text city/country
- Employment status — `Student`, `Employed`, `Unemployed`, `Retired`
- Interests — multi-select from `ActivityField` list (Music, Art, Coding, Fitness, etc.)
- Personality — 10 BFAS aspect scores (0–100), see [recommendation-engine.md](./recommendation-engine.md)
- Motivations — one or more from a fixed list (e.g. "Explore my creative side", "Learn, think, and expand my mind")

**YET TO IMPLEMENT** on the profile:
- Budget level (low / medium / high)
- Social preference (solo / small group / social)
- Energy level (relaxed / focused / active)
- Location context (indoor / outdoor / local / online)

### Recommendation Engine

The app generates personalised activity suggestions such as:

- Build a guitar pedalboard
- Join a beginner boxing class
- Write a short horror screenplay
- Go to a local open mic night

The scoring algorithm uses BFAS personality scores, motivations, and interests to rank activities. See [recommendation-engine.md](./recommendation-engine.md) for the full algorithm.

Each activity currently includes:

- Title
- Slug (URL-friendly identifier)
- Image
- Type — primary `ActivityType` describing the activity's purpose (e.g. `Creative`, `Physical`, `Reflective`)
- Related Types — additional `ActivityType`s the activity also expresses
- Field — the domain/hobby area (e.g. `Music`, `Coding`, `Hiking`) — used for interest matching
- Estimated time (free-text)
- Description (Portable Text / rich text from Sanity)
- Tips (optional, max 3)
- Instructions (optional, ordered steps)

**YET TO IMPLEMENT** on activities:
- Practical constraints — budget level, difficulty, energy type, social level, location type
- Cost range (min/max)

### Activity Exploration

Users can currently:

- Browse personalised suggestions on the recommendations screen
- Open an activity to view its description, tips, and instructions

**YET TO IMPLEMENT**:
- Save interesting activities
- Dismiss irrelevant ones
- Request alternative suggestions

### Feedback Loop — **YET TO IMPLEMENT**

The system will eventually learn from user behaviour to improve future suggestions:

- liked / disliked suggestions
- completed activities
- skipped recommendations

No feedback capture or learning is currently wired up.

## Schema (TypeScript)

Actual shape from [`packages/types/index.ts`](../packages/types/index.ts):

```ts
export type Activity = {
  slug: string;
  title: string;
  imageUrl: string;

  type: ActivityType;
  related_types?: ActivityType[];
  field: ActivityField;

  estimated_time: string;

  description?: PortableTextBlock[];
  tips?: ActivityTip[];           // { key: string; description: string }
  instructions?: ActivityInstruction[]; // { title: string; description?: string }

  // YET TO IMPLEMENT
  // budget_level?: "low" | "medium" | "high";
  // social_level?: "solo" | "small_group" | "social";
  // energy_type?: "relaxed" | "focused" | "active";
  // difficulty?: "easy" | "medium" | "hard";
  // location_type?: "indoor" | "outdoor" | "online" | "local";
  // cost_min?: number;
  // cost_max?: number;
};
```

## Example Data

Reflects the current Sanity `activity` schema in [`apps/sanity/schemaTypes/activity.ts`](../apps/sanity/schemaTypes/activity.ts):

```json
{
  "slug": "build-a-guitar-pedalboard",
  "title": "Build a Guitar Pedalboard",
  "imageUrl": "https://example.com/pedalboard.jpg",
  "type": "Constructive",
  "related_types": ["Creative", "Skill-based"],
  "field": "Music",
  "estimated_time": "One weekend",
  "description": [
    {
      "_type": "block",
      "children": [
        { "_type": "span", "text": "Design and assemble a custom effects pedalboard for your guitar setup." }
      ]
    }
  ],
  "tips": [
    { "key": "abc12345", "description": "Start with a small board — you can always upgrade later." }
  ],
  "instructions": [
    { "title": "Plan your signal chain", "description": "Sketch the order of pedals before buying anything." },
    { "title": "Pick a board size", "description": "Measure your pedals and leave room for cables." }
  ]

  // YET TO IMPLEMENT
  // "budget_level": "medium",
  // "social_level": "solo",
  // "energy_type": "focused",
  // "difficulty": "medium",
  // "location_type": "indoor",
  // "cost_min": 100,
  // "cost_max": 400
}
```
