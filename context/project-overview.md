## Touchgrass - what is it?

A mobile application designed to help people who feel stuck, bored, or stagnant in life discover meaningful, realistic activities/hobbies they can try next.

Instead of overwhelming users with random hobbies that they will never do, the app focuses on personalised, identity-aligned suggestions based on who the user is and what they are capable of doing right now.

The core idea is: Help users who are thinking "I want to try something new, but I don't know what to choose" to become decisive and say "I am going to do this because I am feeling this way and it is realistic for me".

## Core Features

### Profile 

Users define key aspects of themselves, including:

- Interests (e.g. music, fitness, creative arts)
- Personality style (introverted, extroverted, introspective, etc.)
- Budget level (low, medium, high)
- Social preference (solo, small group, social)
- Energy level (relaxed, focused, active)
- Location context (indoor, outdoor, local, online)

### Recommendation Engine

The app generates personalised activity suggestions such as:

- Build a guitar pedalboard
- Join a beginner boxing class
- Write a short horror screenplay
- Go to a local open mic night

Each recommendation includes:

- Title
- Type - what hobby this is (eg. creative, outdoorsy, intellectual, etc.)
- Role - what kind of unspecific role/profession this relates to (eg. artist, builder, scholar, etc. but NOTHING SPECIFIC like musician, plumber, etc.)
- AI-generated summary of why it fits the user
- Practical constraints (budget, difficulty, time)
- Optional tags for filtering and scoring

### Activity Exploration

Users can:

- Browse suggestions
- Save interesting activities
- Dismiss irrelevant ones
- Request alternative suggestions

### Feedback Loop

The system will learn from user behaviour:

- liked / disliked suggestions
- completed activities
- skipped recommendations

This improves future suggestions.

## Schema (TypeScript)

```
export type Recommendation = {
  id: string;

  title: string;
  description?: string;

  category: string;

  tags: string[];

  reason?: string;

  budget_level: "low" | "medium" | "high";
  social_level: "solo" | "small_group" | "social";
  energy_type: "relaxed" | "focused" | "active";

  difficulty: "easy" | "medium" | "hard";

  location_type: "indoor" | "outdoor" | "online" | "local";

  estimated_time?: string;

  cost_min?: number;
  cost_max?: number;

  image_url?: string;

  created_at?: string;
};
```

## Example Data

```
{
  "slug": "build-a-guitar-pedalboard",
  "title": "Build a Guitar Pedalboard",
  "description": "Design and assemble a custom effects pedalboard for your guitar setup.",
  "category": "Music",
  "tags": ["music", "creative", "hands-on", "solo"],
  "reason": "You enjoy music deeply and tend to focus on creative, detail-oriented projects.",
  "budget_level": "medium",
  "social_level": "solo",
  "energy_type": "focused",
  "difficulty": "medium",
  "location_type": "indoor",
  "estimated_time": "One weekend",
  "cost_min": 100,
  "cost_max": 400,
  "image_url": "https://example.com/pedalboard.jpg"
}
```