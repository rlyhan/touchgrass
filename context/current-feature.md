# Call create user endpoint during loading screen

## Summary

On the form submission click, we are immediately taken to the loading screen, after which the POST endpoint is called, and we wait asynchronously for the endpoint to finish successfully, before we get redirect to the recommendations screen. This needs to replace the dummy setTimeout logic we have in the loading screen.

If the POST endpoint fails, we need to display an error message within the loading screen and a button to reattempt the POST request with the label "Try again".

## Parent Branch
recommendation-engine-v1

## Requirements

- On form submission, navigate immediately to the loading screen (do not await the POST before navigating).
- From the loading screen, call the POST create user endpoint asynchronously.
- Replace the existing dummy `setTimeout` logic in the loading screen with the real request lifecycle.
- On a successful response, redirect the user to the recommendations screen.
- On a failed response, render an error message within the loading screen.
- When in the error state, render a "Try again" button that re-attempts the POST request.

## Notes
