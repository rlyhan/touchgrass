# Recommendation detail page

## Summary

Create a recommendation detail page that can be displayed after tapping on a recommendation from the dashboard.

Wire it up inside (authed)/recommendations/detail.tsx. Set up for scalability so that the Activity data passed is fetched from passing the id (eg. rec_001) to a /:id/detail route which returns additional information (we will not set up the route in this feature).

It should immediately pass the current Activity data that is displayed on the dashboard, instantly rendering the title, image and metadata.

As well as the title, image, and metadata, it should render the following which does not currently have data and can just be mocked:
- An AI-generated summary
- Description

Use the provided boilerplate code. Don't replace styles or structure, just make sure it is wired up within auth like the recommendations dashboard is, and is capable of rendering Activity data.

## Parent Branch

## Requirements

- Convert the web boilerplate in [detail.tsx](../apps/mobile/app/(authed)/recommendations/detail.tsx) into a proper React Native screen using RN primitives (`View`, `Text`, `Pressable`, `ScrollView`) and NativeWind
- Replace web-only elements (`div`, `button`, `Image` from Next.js) with their RN equivalents (`expo-image`, `expo-linear-gradient`, `lucide-react-native` icons)
- Wire to Expo Router at `(authed)/recommendations/detail` — receives the activity `id` as a query param (`?id=rec_001`)
- Add a `fetchRecommendationDetail(id)` stub in `lib/recommendations/api.ts` shaped to call `GET /recommendations/:id/detail` — **do not implement the route**; return mocked placeholder data for now so the screen renders
- Render: hero image with gradient + title overlay, metadata row (type, field, estimated_time), AI summary section, description section
- Map `Activity.field` → icon using `getFieldIcon`; map `Activity.type` → icon using `getActivityTypeIcon` (both in `lib/icons.ts`)
- Tapping a `RecommendationCard` on the index page navigates to the detail screen passing the activity id
- Back button calls `router.back()`
- "Start this activity" CTA button at the bottom (no behaviour required yet)

## Implementation

## Notes

- Boilerplate uses `recommendation.image`, `recommendation.fieldIcon`, `recommendation.duration` — map to `Activity.imageUrl`, field icon lookup, and `Activity.estimated_time`
- `fetchRecommendationDetail` should return both the base `Activity` fields and the extended fields (`aiSummary`, `description`) — define a `ActivityDetail` type that extends `Activity`
- The API route itself (`/recommendations/:id/detail`) is out of scope — only the client-side stub and the screen that calls it are in scope
- Mock the return value so the screen renders; the stub should be a single swap to make it call the real endpoint later
