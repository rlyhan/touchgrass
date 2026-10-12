import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native"
import { ActivityIndicator } from "react-native"

// ── router ────────────────────────────────────────────────────────────────────
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}))

// ── api ───────────────────────────────────────────────────────────────────────
// Re-define ProfileNotFoundError inside the factory so the component's
// `instanceof` check resolves against the same class we throw from tests.
jest.mock("@/lib/recommendations/api", () => {
  class ProfileNotFoundError extends Error {
    constructor() {
      super("Profile not found")
      this.name = "ProfileNotFoundError"
    }
  }
  return {
    fetchRecommendations: jest.fn(),
    ProfileNotFoundError,
    UnauthenticatedError: jest.requireActual("@/lib/auth/errors").UnauthenticatedError,
  }
})

// ── heavy native deps ─────────────────────────────────────────────────────────
jest.mock("react-native-safe-area-context", () => require("@/test-utils/mocks").safeAreaMock)

jest.mock("@/components/icons/grass-logo", () => require("@/test-utils/mocks").grassLogoMock)

jest.mock("@/components/activities/activity-card", () => require("@/test-utils/mocks").activityCardMock)

// ── typed references to mocked modules ────────────────────────────────────────
import * as Api from "@/lib/recommendations/api"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { RecommendedActivity } from "@touchgrass/types"
import * as ExpoRouter from "expo-router"

const mockPush = jest.mocked(ExpoRouter.router.push)
const mockReplace = jest.mocked(ExpoRouter.router.replace)
const mockFetchRecommendations = jest.mocked(Api.fetchRecommendations)

// ── fixtures ──────────────────────────────────────────────────────────────────
const RECS: RecommendedActivity[] = [
  { ...RECOMMENDATIONS[0], dominantPatternId: "4-HH" },
  { ...RECOMMENDATIONS[1], dominantPatternId: null },
]

import RecommendationsPage from "@/app/(authed)/(tabs)/recommendations"

// ── tests ─────────────────────────────────────────────────────────────────────
describe("RecommendationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows a spinner while recommendations are loading", () => {
    mockFetchRecommendations.mockReturnValue(new Promise(() => {}))
    render(<RecommendationsPage />)

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy()
    expect(screen.queryByTestId("activity-card")).toBeNull()
  })

  it("renders one card per recommendation when the fetch resolves", async () => {
    mockFetchRecommendations.mockResolvedValue(RECS)
    render(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getAllByTestId("activity-card")).toHaveLength(2)
    })

    expect(screen.getByText(RECS[0].title)).toBeTruthy()
    expect(screen.getByText(RECS[1].title)).toBeTruthy()
  })

  it("pushes the detail route with the dominant pattern when a card is pressed", async () => {
    mockFetchRecommendations.mockResolvedValue(RECS)
    render(<RecommendationsPage />)

    const card = await screen.findByRole("button", {
      name: `View details for ${RECS[0].title}`,
    })
    fireEvent.press(card)

    expect(mockPush).toHaveBeenCalledWith(
      `/activities/${RECS[0].slug}?pattern=4-HH`,
    )
  })

  it("pushes the detail route without a pattern when none was resolved", async () => {
    mockFetchRecommendations.mockResolvedValue(RECS)
    render(<RecommendationsPage />)

    const card = await screen.findByRole("button", {
      name: `View details for ${RECS[1].title}`,
    })
    fireEvent.press(card)

    expect(mockPush).toHaveBeenCalledWith(`/activities/${RECS[1].slug}`)
  })

  it("pushes the browse route when the browse CTA is pressed", async () => {
    mockFetchRecommendations.mockResolvedValue(RECS)
    render(<RecommendationsPage />)

    fireEvent.press(
      await screen.findByRole("button", { name: "Browse more activities" }),
    )

    expect(mockPush).toHaveBeenCalledWith("/browse")
  })

  it("redirects to onboarding when the user has no profile yet", async () => {
    mockFetchRecommendations.mockRejectedValue(new Api.ProfileNotFoundError())
    render(<RecommendationsPage />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/onboarding/basic-details")
    })
    expect(
      screen.queryByText("Couldn't load your recommendations."),
    ).toBeNull()
  })

  it("shows an error state on generic failure and retries on Try again", async () => {
    mockFetchRecommendations.mockRejectedValueOnce(new Error("boom"))
    mockFetchRecommendations.mockResolvedValueOnce(RECS)

    render(<RecommendationsPage />)

    const retry = await screen.findByRole("button", { name: "Try again" })
    expect(screen.getByText("Couldn't load your recommendations.")).toBeTruthy()
    expect(mockReplace).not.toHaveBeenCalled()

    await act(async () => {
      fireEvent.press(retry)
    })

    await waitFor(() => {
      expect(screen.getAllByTestId("activity-card")).toHaveLength(2)
    })
    expect(mockFetchRecommendations).toHaveBeenCalledTimes(2)
  })
})
