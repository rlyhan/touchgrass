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
  }
})

// ── auth ──────────────────────────────────────────────────────────────────────
jest.mock("@/lib/auth/client", () => ({
  signOut: jest.fn(() => Promise.resolve()),
}))

// ── heavy native deps ─────────────────────────────────────────────────────────
jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native")
  return {
    SafeAreaView: ({ children, ...p }: React.PropsWithChildren<object>) => (
      <View {...p}>{children}</View>
    ),
  }
})

jest.mock("@/components/icons/grass-logo", () => {
  const { View } = require("react-native")
  return {
    GrassLogo: (p: object) => <View testID="grass-logo" {...p} />,
  }
})

jest.mock("@/components/recommendations/recommendation-card", () => ({
  RecommendationCard: ({ title }: { title: string }) => {
    const { Text } = require("react-native")
    return <Text testID="recommendation-card">{title}</Text>
  },
}))

// ── typed references to mocked modules ────────────────────────────────────────
import * as Auth from "@/lib/auth/client"
import * as Api from "@/lib/recommendations/api"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import * as ExpoRouter from "expo-router"

const mockPush = jest.mocked(ExpoRouter.router.push)
const mockReplace = jest.mocked(ExpoRouter.router.replace)
const mockFetchRecommendations = jest.mocked(Api.fetchRecommendations)
const mockSignOut = jest.mocked(Auth.signOut)

// ── fixtures ──────────────────────────────────────────────────────────────────
const RECS = RECOMMENDATIONS.slice(0, 2)

import RecommendationsPage from "@/app/(authed)/recommendations"

// ── tests ─────────────────────────────────────────────────────────────────────
describe("RecommendationsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows a spinner while recommendations are loading", () => {
    mockFetchRecommendations.mockReturnValue(new Promise(() => {}))
    render(<RecommendationsPage />)

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy()
    expect(screen.queryByTestId("recommendation-card")).toBeNull()
  })

  it("renders one card per recommendation when the fetch resolves", async () => {
    mockFetchRecommendations.mockResolvedValue(RECS)
    render(<RecommendationsPage />)

    await waitFor(() => {
      expect(screen.getAllByTestId("recommendation-card")).toHaveLength(2)
    })

    expect(screen.getByText(RECS[0].title)).toBeTruthy()
    expect(screen.getByText(RECS[1].title)).toBeTruthy()
  })

  it("pushes the detail route when a card is pressed", async () => {
    mockFetchRecommendations.mockResolvedValue(RECS)
    render(<RecommendationsPage />)

    const card = await screen.findByRole("button", {
      name: `View details for ${RECS[0].title}`,
    })
    fireEvent.press(card)

    expect(mockPush).toHaveBeenCalledWith(
      `/activities/${RECS[0].slug}`,
    )
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
      expect(screen.getAllByTestId("recommendation-card")).toHaveLength(2)
    })
    expect(mockFetchRecommendations).toHaveBeenCalledTimes(2)
  })

  it("signs out and replaces to /sign-in when the footer button is pressed", async () => {
    mockFetchRecommendations.mockResolvedValue(RECS)
    render(<RecommendationsPage />)

    const signOutBtn = await screen.findByRole("button", { name: "Sign out" })
    await act(async () => {
      fireEvent.press(signOutBtn)
    })

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockReplace).toHaveBeenCalledWith("/sign-in")
  })
})
