# Wire getRecommendations to /recommendations screen

## Summary

Allow recommendations to be returned at the /recommendations screen

Coming off the POST request, the user's BFAS scores should be sent to the getRecommendations function that has been provided in packages/core/src/lib/recommendation-algorithm.ts, in order to get a list of recommendations.

Can use the existing mock user to write tests

## Parent Branch
feat/recommendation-algorithm

## Requirements

- After the POST request on the /recommendations screen, pass the user's BFAS scores into `getRecommendations` from `packages/core/src/lib/recommendation-algorithm.ts`
- Render the returned list of recommendations on the /recommendations screen
- Write tests for this wiring using the existing mock user

## Notes
