# Changelog

## 2026-04-26 — Recommendation Card Icons

- Added a coherent icon lookup system (`lib/icons.ts`) that maps each recommendation `type` (Constructive, Active, Artistic, Intellectual, Outdoorsy, Social, Reflective, Creative, Adventurous, Professional) and `field` (Music, Martial Arts, Literature, Cooking, Photography, Gaming, Fitness, Coding, Science, Nature, Film, Theater, Visual Art, Writing, Dance, Cycling, Hiking, Travel, Wellness, Astronomy) to a meaningful lucide icon, with fallbacks for unknown labels.
- Updated `RecommendationCard` to render the looked-up icons for `type` and `field`.
- Added optional `estimatedTime` prop to `RecommendationCard`, always rendered with a clock icon.
