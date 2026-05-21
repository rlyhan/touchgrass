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
  }
})

// ── typed references to mocked modules ────────────────────────────────────────
import * as Api from "@/lib/recommendations/api"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { Activity } from "@touchgrass/types"
import * as ExpoRouter from "expo-router"

const ACTIVITY = RECOMMENDATIONS[0]
const ACTIVITY_WITH_DESCRIPTION: Activity = {
  ...ACTIVITY,
  description: "First paragraph.\n\nSecond paragraph.",
}

const mockBack = jest.mocked(ExpoRouter.router.back)
const mockReplace = jest.mocked(ExpoRouter.router.replace)
const mockCanGoBack = jest.mocked(ExpoRouter.router.canGoBack)
const mockUseLocalSearchParams = jest.mocked(ExpoRouter.useLocalSearchParams)
const mockGetCachedActivity = jest.mocked(Api.getCachedActivity)
const mockFetchActivityBySlug = jest.mocked(Api.fetchActivityBySlug)

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
      render(<ActivityDetailPage />)
      expect(mockFetchActivityBySlug).not.toHaveBeenCalled()
    })

    it("renders the cached card and CTA", () => {
      render(<ActivityDetailPage />)

      expect(screen.getByTestId("recommendation-card")).toBeTruthy()
      expect(screen.getByText(ACTIVITY.title)).toBeTruthy()
      expect(screen.getByTestId("primary-button")).toBeTruthy()
    })

    it("renders the description as paragraphs when set on the activity", () => {
      mockGetCachedActivity.mockReturnValue(ACTIVITY_WITH_DESCRIPTION)
      render(<ActivityDetailPage />)

      expect(screen.getByText("About this activity")).toBeTruthy()
      expect(screen.getByText("First paragraph.")).toBeTruthy()
      expect(screen.getByText("Second paragraph.")).toBeTruthy()
    })

    it("hides the description section when the activity has no description", () => {
      // Default ACTIVITY has no description
      render(<ActivityDetailPage />)
      expect(screen.queryByText("About this activity")).toBeNull()
    })

    it("calls router.back when the back button is pressed and history exists", async () => {
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
      mockCanGoBack.mockReturnValue(false)
      render(<ActivityDetailPage />)

      const backButton = screen.getByRole("button", { name: "Go back" })
      await act(async () => {
        fireEvent.press(backButton)
      })

      expect(mockReplace).toHaveBeenCalledWith("/recommendations")
      expect(mockBack).not.toHaveBeenCalled()
    })
  })
})
