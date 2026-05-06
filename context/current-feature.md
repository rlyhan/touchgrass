# POST endpoint creates user

## Summary

Set up a new POST endpoint to receive the form submission sent from the Motivation screen and create a new user in the database.

## Parent Branch
recommendation-engine-v1

## Requirements

- Add a POST route on the microservice that accepts the onboarding form payload
- Validate the request body using the existing onboarding zod schema; respond with 400 and validation errors if invalid
- Insert a new user record into the database via Drizzle using the validated payload
- Return a success response (e.g. 201) on successful creation
- Return 500 with an error message if the database write fails

## Notes
