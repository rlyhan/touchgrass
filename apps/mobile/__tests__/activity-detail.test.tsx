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

// ── pattern weights ───────────────────────────────────────────────────────────
// Stub out the patterns cache + hook so the accordion stays hidden by default
// (no weights resolved). Individual tests can override these to exercise the
// match copy.
jest.mock("@/lib/patterns/cache", () => ({
  resolveDominantPattern: jest.fn(() => null),
}))
jest.mock("@/lib/patterns/use-pattern-weights", () => ({
  usePatternWeights: jest.fn(() => ({ weights: undefined, status: "loading" })),
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
    Lightbulb: (p: object) => <View testID="lightbulb-icon" {...p} />,
    ChevronDown: (p: object) => <View testID="chevron-down" {...p} />,
  }
})

// ── typed references to mocked modules ────────────────────────────────────────
import * as Api from "@/lib/recommendations/api"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { Activity } from "@touchgrass/types"
import * as ExpoRouter from "expo-router"

// Strip description/instructions/tips so each section's empty-state can be
// asserted independently; the section-present cases construct their own
// fixtures below.
const ACTIVITY: Activity = {
  ...RECOMMENDATIONS[0],
  description: undefined,
  instructions: undefined,
  tips: undefined,
}
const ACTIVITY_WITH_DESCRIPTION: Activity = {
  ...ACTIVITY,
  description: [
    {
      _type: "block",
      _key: "p1",
      style: "normal",
      children: [{ _type: "span", _key: "p1s1", text: "First paragraph.", marks: [] }],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "p2",
      style: "normal",
      children: [{ _type: "span", _key: "p2s1", text: "Second paragraph.", marks: [] }],
      markDefs: [],
    },
  ],
}

const ACTIVITY_WITH_INSTRUCTIONS: Activity = {
  ...ACTIVITY,
  instructions: [
    { title: "Gather materials", description: "Buy a board and pedals." },
    { title: "Assemble the board", description: "Attach pedals with velcro." },
    { title: "Wire it up" },
  ],
}

const ACTIVITY_WITH_TIPS: Activity = {
  ...ACTIVITY,
  tips: [
    { key: "tip-a", description: "Start with a small board." },
    { key: "tip-b", description: "Use velcro for flexibility." },
  ],
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
      // Default revalidation: server returns the same activity. Tests that
      // care about specific revalidation behavior override this.
      mockFetchActivityBySlug.mockResolvedValue(ACTIVITY)
    })

    it("revalidates from the network even when the activity is cached", () => {
      render(<ActivityDetailPage />)
      expect(mockFetchActivityBySlug).toHaveBeenCalledWith(ACTIVITY.slug)
    })

    it("keeps showing the cached activity if revalidation fails", async () => {
      mockFetchActivityBySlug.mockRejectedValue(new Error("network error"))
      render(<ActivityDetailPage />)

      await waitFor(() => expect(mockFetchActivityBySlug).toHaveBeenCalled())
      expect(screen.getByTestId("recommendation-card")).toBeTruthy()
      expect(screen.queryByText("Couldn't load activity.")).toBeNull()
    })

    it("updates the displayed activity when revalidation returns fresh data", async () => {
      const fresh: Activity = { ...ACTIVITY, title: "Fresh title from Sanity" }
      mockFetchActivityBySlug.mockResolvedValue(fresh)
      render(<ActivityDetailPage />)

      await waitFor(() => {
        expect(screen.getByText("Fresh title from Sanity")).toBeTruthy()
      })
    })

    it("renders the cached card and CTA", () => {
      render(<ActivityDetailPage />)

      expect(screen.getByTestId("recommendation-card")).toBeTruthy()
      expect(screen.getByText(ACTIVITY.title)).toBeTruthy()
      // expect(screen.getByTestId("primary-button")).toBeTruthy()
    })

    it("renders the description as paragraphs when set on the activity", () => {
      mockGetCachedActivity.mockReturnValue(ACTIVITY_WITH_DESCRIPTION)
      mockFetchActivityBySlug.mockResolvedValue(ACTIVITY_WITH_DESCRIPTION)
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

    it("renders the instructions section with numbered items when present", () => {
      mockGetCachedActivity.mockReturnValue(ACTIVITY_WITH_INSTRUCTIONS)
      mockFetchActivityBySlug.mockResolvedValue(ACTIVITY_WITH_INSTRUCTIONS)
      render(<ActivityDetailPage />)

      expect(screen.getByText("Instructions")).toBeTruthy()
      expect(screen.getByText("1")).toBeTruthy()
      expect(screen.getByText("2")).toBeTruthy()
      expect(screen.getByText("3")).toBeTruthy()
      expect(screen.getByText("Gather materials")).toBeTruthy()
      expect(screen.getByText("Assemble the board")).toBeTruthy()
      expect(screen.getByText("Wire it up")).toBeTruthy()
      expect(screen.getByText("Buy a board and pedals.")).toBeTruthy()
      expect(screen.getByText("Attach pedals with velcro.")).toBeTruthy()
    })

    it("hides the instructions section when the activity has no instructions", () => {
      // Default ACTIVITY has no instructions
      render(<ActivityDetailPage />)
      expect(screen.queryByText("Instructions")).toBeNull()
    })

    it("hides the instructions section when instructions is an empty array", () => {
      const empty: Activity = { ...ACTIVITY, instructions: [] }
      mockGetCachedActivity.mockReturnValue(empty)
      mockFetchActivityBySlug.mockResolvedValue(empty)
      render(<ActivityDetailPage />)
      expect(screen.queryByText("Instructions")).toBeNull()
    })

    it("renders each tip with the 'Tip:' prefix and a lightbulb icon when present", () => {
      mockGetCachedActivity.mockReturnValue(ACTIVITY_WITH_TIPS)
      mockFetchActivityBySlug.mockResolvedValue(ACTIVITY_WITH_TIPS)
      render(<ActivityDetailPage />)

      expect(screen.getAllByTestId("lightbulb-icon")).toHaveLength(2)
      expect(screen.getAllByText("Tip: ")).toHaveLength(2)
      expect(screen.getByText(/Start with a small board\./)).toBeTruthy()
      expect(screen.getByText(/Use velcro for flexibility\./)).toBeTruthy()
    })

    it("hides the tips section when the activity has no tips", () => {
      // Default ACTIVITY has no tips
      render(<ActivityDetailPage />)
      expect(screen.queryByTestId("lightbulb-icon")).toBeNull()
    })

    it("hides the tips section when tips is an empty array", () => {
      const empty: Activity = { ...ACTIVITY, tips: [] }
      mockGetCachedActivity.mockReturnValue(empty)
      mockFetchActivityBySlug.mockResolvedValue(empty)
      render(<ActivityDetailPage />)
      expect(screen.queryByTestId("lightbulb-icon")).toBeNull()
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

  describe("pattern-match accordion", () => {
    const mockResolveDominantPattern = jest.mocked(
      require("@/lib/patterns/cache").resolveDominantPattern,
    )
    const mockUsePatternWeights = jest.mocked(
      require("@/lib/patterns/use-pattern-weights").usePatternWeights,
    )

    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ slug: ACTIVITY.slug })
      mockGetCachedActivity.mockReturnValue(ACTIVITY)
      mockFetchActivityBySlug.mockResolvedValue(ACTIVITY)
    })

    it("hides the accordion when no dominant pattern resolves", () => {
      mockUsePatternWeights.mockReturnValue({
        weights: { "4-HH": 0.5 },
        status: "ready",
      })
      mockResolveDominantPattern.mockReturnValue(null)
      render(<ActivityDetailPage />)

      expect(screen.queryByText(/You were matched/)).toBeNull()
    })

    it("hides the accordion while pattern weights are still loading", () => {
      mockUsePatternWeights.mockReturnValue({
        weights: undefined,
        status: "loading",
      })
      render(<ActivityDetailPage />)
      expect(screen.queryByText(/You were matched/)).toBeNull()
    })

    it("renders the match copy and reveals the short description on expand", () => {
      mockUsePatternWeights.mockReturnValue({
        weights: { "4-HH": 0.9 },
        status: "ready",
      })
      // 4-HH → Enchanting Visionary
      mockResolveDominantPattern.mockReturnValue("4-HH")
      render(<ActivityDetailPage />)

      const trigger = screen.getByRole("button", {
        name: "Expand pattern details",
      })
      expect(
        screen.getByText(/You were matched because you scored highly as a/),
      ).toBeTruthy()
      expect(screen.getByText("Enchanting Visionary")).toBeTruthy()
      const expectedDescription =
        require("@touchgrass/types/constants").PATTERN_TYPES.find(
          (p: { id: string }) => p.id === "4-HH",
        ).shortDescription
      expect(screen.queryByText(expectedDescription)).toBeNull()
      expect(screen.getByText("See more")).toBeTruthy()

      fireEvent.press(trigger)

      expect(screen.getByText(expectedDescription)).toBeTruthy()
      expect(screen.getByText("See less")).toBeTruthy()
    })
  })
})
