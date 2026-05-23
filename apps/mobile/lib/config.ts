export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  // eslint-disable-next-line no-undef
  (__DEV__ ? "http://localhost:3000" : (() => { throw new Error("EXPO_PUBLIC_API_BASE_URL must be set in production builds") })())
