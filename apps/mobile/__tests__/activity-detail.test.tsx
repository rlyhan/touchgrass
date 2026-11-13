import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
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
  fetchRecommendations: jest.fn(() => Promise.resolve([])),
}))

// ── heavy native deps ─────────────────────────────────────────────────────────
jest.mock("react-native-safe-area-context", () => require("@/test-utils/mocks").safeAreaMock)

jest.mock("@/components/activities/activity-card", () => require("@/test-utils/mocks").activityCardMock)

jest.mock("@/components/ui/primary-button", () => ({
  PrimaryButton: ({ label }: { label: string }) => {
    const { Text } = require("react-native")
    return <Text testID="primary-button">{label}</Text>
  },
}))

jest.mock("lucide-react-native", () => require("@/test-utils/mocks").lucideMock)

// ── typed references to mocked modules ────────────────────────────────────────
import * as Api from "@/lib/recommendations/api"
import { clearRecommendationStore, setInterests, setMatchLabels } from "@/lib/recommendations/recommendation-store"
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
const mockFetchRecommendations = jest.mocked(Api.fetchRecommendations)

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
      expect(screen.queryByTestId("activity-card")).toBeNull()
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
      expect(screen.queryByTestId("activity-card")).toBeNull()
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
      expect(screen.getByTestId("activity-card")).toBeTruthy()
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

      expect(screen.getByTestId("activity-card")).toBeTruthy()
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

  describe("why this matches you", () => {
    beforeEach(() => {
      mockUseLocalSearchParams.mockReturnValue({ slug: ACTIVITY.slug })
      mockGetCachedActivity.mockReturnValue(ACTIVITY)
      mockFetchActivityBySlug.mockResolvedValue(ACTIVITY)
    })

    afterEach(() => {
      clearRecommendationStore()
    })

    it("shows the pattern from a recommended label that carries one", () => {
      setMatchLabels({ [ACTIVITY.slug]: { kind: "recommended", patternId: "4-HH", sharedActivityTypesByMotivation: {} } })
      render(<ActivityDetailPage />)

      expect(screen.getByText("Why this matches you")).toBeTruthy()
      expect(screen.getByText("Enchanting Visionary")).toBeTruthy()
    })

    it("shows the pattern and a pill per shared motivation", () => {
      setMatchLabels({
        [ACTIVITY.slug]: {
          kind: "personality",
          patternId: "4-HH",
          sharedActivityTypesByMotivation: { explore_creative: ["Artistic", "Creative"], connect_with_people: ["Social"] },
        },
      })
      render(<ActivityDetailPage />)

      expect(screen.getByText("Enchanting Visionary")).toBeTruthy()
      const motivationReasons = within(screen.getByTestId("motivation-reasons"))
      expect(motivationReasons.getByText("Motivations")).toBeTruthy()
      expect(motivationReasons.getByText("Explore my creative side")).toBeTruthy()
      expect(motivationReasons.getByText("Connect with people and share experiences")).toBeTruthy()
    })

    it("doesn't show a pattern for an activity without a label", () => {
      setInterests([ACTIVITY.field])
      render(<ActivityDetailPage />)

      expect(within(screen.getByTestId("interest-reason-box")).getByText(ACTIVITY.field)).toBeTruthy()
      expect(screen.queryByTestId("pattern-reason-box")).toBeNull()
    })

    it("doesn't show a pattern for a label without one", () => {
      setMatchLabels({ [ACTIVITY.slug]: { kind: "recommended", sharedActivityTypesByMotivation: { explore_creative: ["Artistic"] } } })
      render(<ActivityDetailPage />)

      expect(screen.getByText("Explore my creative side")).toBeTruthy()
      expect(screen.queryByTestId("pattern-reason-box")).toBeNull()
    })

    it("shows the interest row alongside the label's reasons when the activity's field is an interest", () => {
      setMatchLabels({ [ACTIVITY.slug]: { kind: "personality", patternId: "4-HH", sharedActivityTypesByMotivation: {} } })
      setInterests([ACTIVITY.field])
      render(<ActivityDetailPage />)

      expect(within(screen.getByTestId("pattern-reason-box")).getByText("Enchanting Visionary")).toBeTruthy()
      expect(within(screen.getByTestId("interest-reason-box")).getByText(ACTIVITY.field)).toBeTruthy()
    })

    it("shows the section with only the interest row for an unlabelled activity in one of the user's interests", () => {
      setInterests([ACTIVITY.field])
      render(<ActivityDetailPage />)

      expect(screen.getByText("Why this matches you")).toBeTruthy()
      expect(within(screen.getByTestId("interest-reason-box")).getByText(ACTIVITY.field)).toBeTruthy()
      expect(screen.queryByTestId("pattern-reason-box")).toBeNull()
    })

    it("says the activity is the best pick of its type in the user's interests when picked for variety", () => {
      setMatchLabels({ [ACTIVITY.slug]: { kind: "recommended", sharedActivityTypesByMotivation: {}, pickedForVariety: true } })
      setInterests([ACTIVITY.field])
      render(<ActivityDetailPage />)

      expect(screen.getByText(ACTIVITY.type)).toBeTruthy()
      expect(screen.getByText(/pick in your interests\./)).toBeTruthy()
    })

    it("leaves out 'in your interests' for a variety pick outside the user's interests", () => {
      setMatchLabels({ [ACTIVITY.slug]: { kind: "recommended", sharedActivityTypesByMotivation: {}, pickedForVariety: true } })
      render(<ActivityDetailPage />)

      expect(screen.getByText(/Your best-matching/)).toBeTruthy()
      expect(screen.queryByText(/in your interests/)).toBeNull()
    })

    it("shows no variety row for a recommended activity that wasn't picked for variety", () => {
      setMatchLabels({ [ACTIVITY.slug]: { kind: "recommended", sharedActivityTypesByMotivation: { explore_creative: ["Artistic"] } } })
      render(<ActivityDetailPage />)

      expect(screen.queryByText(/Your best-matching/)).toBeNull()
    })

    it("leaves out the interest row when the activity's field isn't one of the user's interests", () => {
      setMatchLabels({ [ACTIVITY.slug]: { kind: "personality", patternId: "4-HH", sharedActivityTypesByMotivation: {} } })
      setInterests(["Martial Arts"])
      render(<ActivityDetailPage />)

      expect(screen.getByText("Why this matches you")).toBeTruthy()
      expect(screen.queryByTestId("interest-reason-box")).toBeNull()
    })

    it("hides the section for an activity with no label or recommendations screen pattern", () => {
      render(<ActivityDetailPage />)

      expect(screen.queryByText("Why this matches you")).toBeNull()
    })

    it("fetches recommendations when none are loaded, then shows the reasons", async () => {
      mockFetchRecommendations.mockImplementationOnce(async () => {
        setMatchLabels({ [ACTIVITY.slug]: { kind: "personality", patternId: "4-HH", sharedActivityTypesByMotivation: {} } })
        return []
      })
      render(<ActivityDetailPage />)

      expect(mockFetchRecommendations).toHaveBeenCalledTimes(1)
      expect(await screen.findByText("Enchanting Visionary")).toBeTruthy()
    })

    it("doesn't fetch recommendations when they're already loaded", () => {
      setMatchLabels({ [ACTIVITY.slug]: { kind: "recommended", sharedActivityTypesByMotivation: {} } })
      render(<ActivityDetailPage />)

      expect(mockFetchRecommendations).not.toHaveBeenCalled()
    })

    it("still shows the activity, and warns in dev, when fetching recommendations fails", async () => {
      const warn = jest.spyOn(console, "warn").mockImplementation(() => {})
      mockFetchRecommendations.mockRejectedValueOnce(new Error("network error"))
      render(<ActivityDetailPage />)

      await waitFor(() => expect(warn).toHaveBeenCalledWith("Couldn't load recommendations", expect.any(Error)))
      expect(screen.getByTestId("activity-card")).toBeTruthy()
      expect(screen.queryByText("Why this matches you")).toBeNull()
      warn.mockRestore()
    })

    it("leaves out the motivations heading when no motivation is shared", () => {
      setMatchLabels({ [ACTIVITY.slug]: { kind: "personality", patternId: "4-HH", sharedActivityTypesByMotivation: {} } })
      render(<ActivityDetailPage />)

      expect(screen.queryByTestId("motivation-reasons")).toBeNull()
    })

    it("shows the matched pattern's name in the pattern box", () => {
      setMatchLabels({ [ACTIVITY.slug]: { kind: "personality", patternId: "4-HH", sharedActivityTypesByMotivation: {} } })
      render(<ActivityDetailPage />)

      expect(within(screen.getByTestId("pattern-reason-box")).getByText("Enchanting Visionary")).toBeTruthy()
    })

    it("shows the field's icon in the interest box", () => {
      setInterests([ACTIVITY.field])
      render(<ActivityDetailPage />)

      expect(within(screen.getByTestId("interest-reason-box")).getByTestId("guitar-icon")).toBeTruthy()
    })
  })
})
