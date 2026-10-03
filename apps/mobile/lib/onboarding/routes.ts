// Single source of truth for onboarding step paths, in flow order.
export const ONBOARDING_ROUTES = {
  name: "/onboarding/name",
  basicDetails: "/onboarding/basic-details",
  interests: "/onboarding/interests",
  personality: "/onboarding/personality",
  motivation: "/onboarding/motivation",
  loading: "/onboarding/loading",
} as const

export type OnboardingRoute = (typeof ONBOARDING_ROUTES)[keyof typeof ONBOARDING_ROUTES]

// The name step is where sign-up happens, so it's the only onboarding screen
// reachable without a session. Every later step assumes an account exists.
const PUBLIC_ONBOARDING_ROUTES: ReadonlySet<string> = new Set<OnboardingRoute>([
  ONBOARDING_ROUTES.name,
])

export function isOnboardingRoute(pathname: string): pathname is OnboardingRoute {
  return (Object.values(ONBOARDING_ROUTES) as string[]).includes(pathname)
}

export function onboardingRouteRequiresAuth(pathname: string): boolean {
  return !PUBLIC_ONBOARDING_ROUTES.has(pathname)
}
