import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native"
import { ActivityIndicator } from "react-native"

// ── router ────────────────────────────────────────────────────────────────────
// jest.mock factories are hoisted above const declarations, so we must define
// mock fns inline and reference them via the module after import.
jest.mock("expo-router", () => ({
  router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn() },
  useLocalSearchParams: jest.fn(),
}))

// ── api ───────────────────────────────────────────────────────────────────────
jest.mock("@/lib/recommendations/api", () => ({
  getCachedActivity: jest.fn(),
  fetchActivityBySlug: jest.fn(),
  fetchRecommendationDetail: jest.fn(),
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

jest.mock("@/components/recommendations/recommendation-card", () => ({
  RecommendationCard: ({ title }: { title: string }) => {
    const { Text } = require("react-native")
    return <Text testID="recommendation-card">{title}</Text>
  },
}))

jest.mock("@/components/ui/primary-button", () => ({
  PrimaryButton: ({ label }: { label: string }) => {
    const { Text } = require("react-native")
    return <Text testID="primary-button">{label}</Text>
  },
}))

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native")
  return {
    ArrowLeft: (p: object) => <View {...p} />,
    Sparkle: (p: object) => <View {...p} />,
  }
})

// ── typed references to mocked modules ────────────────────────────────────────
import type { ActivityDetailExtended } from "@/lib/recommendations/api"
import * as Api from "@/lib/recommendations/api"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import * as ExpoRouter from "expo-router"

const ACTIVITY = RECOMMENDATIONS[0]

const mockBack = jest.mocked(ExpoRouter.router.back)
const mockReplace = jest.mocked(ExpoRouter.router.replace)
const mockCanGoBack = jest.mocked(ExpoRouter.router.canGoBack)
const mockUseLocalSearchParams = jest.mocked(ExpoRouter.useLocalSearchParams)
const mockGetCachedActivity = jest.mocked(Api.getCachedActivity)
const mockFetchActivityBySlug = jest.mocked(Api.fetchActivityBySlug)
const mockFetchRecommendationDetail = jest.mocked(Api.fetchRecommendationDetail)

// ── fixtures ──────────────────────────────────────────────────────────────────
const EXTENDED: ActivityDetailExtended = {
  aiSummary: "Great fit for your creative interests.",
  description: "First paragraph.\n\nSecond paragraph.",
}

import ActivityDetailPage from "@/app/(authed)/activities/[slug]"

// ── tests ─────────────────────────────────────────────────────────────────────
describe("ActivityDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("activity not found", () => {
    it("shows not-found message when slug is absent", () => {
      mockUseLocalSearchParams.mockReturnValue({})
      render(<ActivityDetailPage />)
      expect(screen.getByText("Activity not found.")).toBeTruthy()
      expect(screen.queryByTestId("recommendation-card")).toBeNull()
    })

    it("shows a spinner while fetching, then not-found when the server has no such activity", async () => {
      mockUseLocalSearchParams.mockReturnValue({ slug: "unknown" })
      mockGetCachedActivity.mockReturnValue(undefined)
      mockFetchActivityBySlug.mockResolvedValue(null)
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))

      render(<ActivityDetailPage />)

      expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy()

      await waitFor(() => {
        expect(screen.getByText("Activity not found.")).toBeTruthy()
      })
      expect(screen.queryByTestId("recommendation-card")).toBeNull()
    })

    it("fetches the activity from the network when the cache misses and renders it", async () => {
      mockUseLocalSearchParams.mockReturnValue({ slug: ACTIVITY.slug })
      mockGetCachedActivity.mockReturnValue(undefined)
      mockFetchActivityBySlug.mockResolvedValue(ACTIVITY)
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))

      render(<ActivityDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(ACTIVITY.title)).toBeTruthy()
      })
      expect(mockFetchActivityBySlug).toHaveBeenCalledWith(ACTIVITY.slug)
    })

    it("shows an error message when the activity fetch rejects", async () => {
      mockUseLocalSearchParams.mockReturnValue({ slug: ACTIVITY.slug })
      mockGetCachedActivity.mockReturnValue(undefined)
      mockFetchActivityBySlug.mockRejectedValue(new Error("network error"))
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))

      render(<ActivityDetailPage />)

      await waitFor(() => {
        expect(screen.getByText("Couldn't load activity.")).toBeTruthy()
      })
    })
  })

  describe("activity found", () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ slug: ACTIVITY.slug })
      mockGetCachedActivity.mockReturnValue(ACTIVITY)
    })

    it("does not hit the network when the activity is already cached", () => {
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))
      render(<ActivityDetailPage />)
      expect(mockFetchActivityBySlug).not.toHaveBeenCalled()
    })

    it("renders the cached card with a spinner for extended details on first paint", () => {
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))
      render(<ActivityDetailPage />)

      expect(screen.getByTestId("recommendation-card")).toBeTruthy()
      expect(screen.getByText(ACTIVITY.title)).toBeTruthy()
      expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy()
      expect(screen.queryByText(EXTENDED.aiSummary)).toBeNull()
    })

    it("renders extended summary and description when the fetch resolves", async () => {
      mockFetchRecommendationDetail.mockResolvedValue(EXTENDED)
      render(<ActivityDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(EXTENDED.aiSummary)).toBeTruthy()
      })

      expect(screen.getByText("First paragraph.")).toBeTruthy()
      expect(screen.getByText("Second paragraph.")).toBeTruthy()
      expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull()
    })

    it("hides the extended section but keeps the card and CTA when the fetch rejects", async () => {
      mockFetchRecommendationDetail.mockRejectedValue(new Error("network error"))
      render(<ActivityDetailPage />)

      await waitFor(() => {
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull()
      })

      expect(screen.queryByText(EXTENDED.aiSummary)).toBeNull()
      expect(screen.getByTestId("recommendation-card")).toBeTruthy()
      expect(screen.getByTestId("primary-button")).toBeTruthy()
    })

    it("calls router.back when the back button is pressed and history exists", async () => {
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))
      mockCanGoBack.mockReturnValue(true)
      render(<ActivityDetailPage />)

      const backButton = screen.getByRole("button", { name: "Go back" })
      await act(async () => {
        fireEvent.press(backButton)
      })

      expect(mockBack).toHaveBeenCalledTimes(1)
      expect(mockReplace).not.toHaveBeenCalled()
    })

    it("redirects to recommendations when the back button is pressed and there's no history (deep link)", async () => {
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))
      mockCanGoBack.mockReturnValue(false)
      render(<ActivityDetailPage />)

      const backButton = screen.getByRole("button", { name: "Go back" })
      await act(async () => {
        fireEvent.press(backButton)
      })

      expect(mockReplace).toHaveBeenCalledWith("/recommendations")
      expect(mockBack).not.toHaveBeenCalled()
    })

    it("calls fetchRecommendationDetail with the activity slug", () => {
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))
      render(<ActivityDetailPage />)
      expect(mockFetchRecommendationDetail).toHaveBeenCalledWith(ACTIVITY.slug)
    })
  })
})
