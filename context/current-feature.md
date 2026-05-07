# Implement Better Auth

## Summary

Set up Better Auth so that users can persist their sessions instead of going through the onboarding session all over again.

In the same screen where they enter their name they should also enter their email address, password, and confirm password.

Better Auth was chosen over Neon Auth and Clerk because it runs as a TypeScript library inside the existing `packages/core` Express server and stores users directly in the existing Neon DB via the Drizzle adapter — no third-party service or webhook sync layer.

## Parent Branch

## Requirements

- Integrate Neon Auth into the app to enable user account creation and session persistence
- Extend the existing onboarding name screen to also collect:
  - Email address
  - Password
  - Confirm password
- Validate email format and that password matches confirm password before submission
- On submission, create a Neon Auth account (sign-up) tied to the user's onboarding data
- Persist the authenticated session locally so returning users skip the full onboarding flow
- On app launch, check for an existing session and route the user accordingly (onboarding vs. main app)
- Provide a sign-in path for returning users on a different device (or after sign-out)
- Provide a sign-out action somewhere in the app
- Handle and surface auth errors (invalid email, weak password, email already in use, network errors)

## Notes

- Server-side auth: `better-auth` mounted in the existing `packages/core` Express app, Drizzle adapter against Neon
- Mobile: `@better-auth/expo` client; tokens in `expo-secure-store` on native, browser cookie jar on web
- `BETTER_AUTH_SECRET` in server `.env.local`; `EXPO_PUBLIC_API_BASE_URL` for the mobile client
- Link auth user → profile via an `auth_user_id` column on `profiles` so API endpoints can derive identity from the session instead of taking IDs in URLs
