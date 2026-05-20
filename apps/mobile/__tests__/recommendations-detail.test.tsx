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
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}))

// ── api ───────────────────────────────────────────────────────────────────────
jest.mock("@/lib/recommendations/api", () => ({
  getCachedActivity: jest.fn(),
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
const mockUseLocalSearchParams = jest.mocked(ExpoRouter.useLocalSearchParams)
const mockGetCachedActivity = jest.mocked(Api.getCachedActivity)
const mockFetchRecommendationDetail = jest.mocked(Api.fetchRecommendationDetail)

// ── fixtures ──────────────────────────────────────────────────────────────────
const EXTENDED: ActivityDetailExtended = {
  aiSummary: "Great fit for your creative interests.",
  description: "First paragraph.\n\nSecond paragraph.",
}

import RecommendationDetailPage from "@/app/(authed)/recommendations/detail"

// ── tests ─────────────────────────────────────────────────────────────────────
describe("RecommendationDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("activity not found", () => {
    it("shows not-found message when id is absent", () => {
      mockUseLocalSearchParams.mockReturnValue({})
      render(<RecommendationDetailPage />)
      expect(screen.getByText("Activity not found.")).toBeTruthy()
      expect(screen.queryByTestId("recommendation-card")).toBeNull()
    })

    it("shows not-found message when id is not in cache", () => {
      mockUseLocalSearchParams.mockReturnValue({ id: "unknown" })
      mockGetCachedActivity.mockReturnValue(undefined)
      // id is truthy so useEffect will fire — give it a pending promise
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))

      render(<RecommendationDetailPage />)

      expect(screen.getByText("Activity not found.")).toBeTruthy()
      expect(screen.queryByTestId("recommendation-card")).toBeNull()
    })
  })

  describe("activity found", () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ id: ACTIVITY.id })
      mockGetCachedActivity.mockReturnValue(ACTIVITY)
    })

    it("renders the cached card with a spinner for extended details on first paint", () => {
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))
      render(<RecommendationDetailPage />)

      expect(screen.getByTestId("recommendation-card")).toBeTruthy()
      expect(screen.getByText(ACTIVITY.title)).toBeTruthy()
      expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy()
      expect(screen.queryByText(EXTENDED.aiSummary)).toBeNull()
    })

    it("renders extended summary and description when the fetch resolves", async () => {
      mockFetchRecommendationDetail.mockResolvedValue(EXTENDED)
      render(<RecommendationDetailPage />)

      await waitFor(() => {
        expect(screen.getByText(EXTENDED.aiSummary)).toBeTruthy()
      })

      expect(screen.getByText("First paragraph.")).toBeTruthy()
      expect(screen.getByText("Second paragraph.")).toBeTruthy()
      expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull()
    })

    it("hides the extended section but keeps the card and CTA when the fetch rejects", async () => {
      mockFetchRecommendationDetail.mockRejectedValue(new Error("network error"))
      render(<RecommendationDetailPage />)

      await waitFor(() => {
        expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull()
      })

      expect(screen.queryByText(EXTENDED.aiSummary)).toBeNull()
      expect(screen.getByTestId("recommendation-card")).toBeTruthy()
      expect(screen.getByTestId("primary-button")).toBeTruthy()
    })

    it("calls router.back when the back button is pressed", async () => {
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))
      render(<RecommendationDetailPage />)

      const backButton = screen.getByRole("button", { name: "Go back" })
      await act(async () => {
        fireEvent.press(backButton)
      })

      expect(mockBack).toHaveBeenCalledTimes(1)
    })

    it("calls fetchRecommendationDetail with the activity id", () => {
      mockFetchRecommendationDetail.mockReturnValue(new Promise(() => {}))
      render(<RecommendationDetailPage />)
      expect(mockFetchRecommendationDetail).toHaveBeenCalledWith(ACTIVITY.id)
    })
  })
})
