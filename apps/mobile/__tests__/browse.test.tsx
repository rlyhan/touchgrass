import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { FlatList } from "react-native"

// ── router / auth ─────────────────────────────────────────────────────────────
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}))

jest.mock("@/lib/auth/client", () => ({
  signOut: jest.fn(() => Promise.resolve({ data: { success: true }, error: null })),
  useSession: jest.fn(() => ({ data: null, isPending: false })),
}))

// ── search api ────────────────────────────────────────────────────────────────
jest.mock("@/lib/browse/api", () => ({
  searchActivities: jest.fn(),
}))

// ── heavy native deps ─────────────────────────────────────────────────────────
jest.mock("expo-image", () => ({
  Image: { prefetch: jest.fn(() => Promise.resolve(true)) },
}))

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native")
  return {
    ChevronLeft: () => <View />,
    ChevronRight: () => <View />,
    Search: () => <View />,
    X: () => <View />,
  }
})

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
  return { GrassLogo: (p: object) => <View testID="grass-logo" {...p} /> }
})

jest.mock("@/components/activities/activity-card", () => ({
  ActivityCard: ({ title }: { title: string }) => {
    const { Text } = require("react-native")
    return <Text testID="activity-card">{title}</Text>
  },
}))

import * as BrowseApi from "@/lib/browse/api"
import { Image } from "expo-image"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"

import BrowsePage from "@/app/browse"

const mockSearchActivities = jest.mocked(BrowseApi.searchActivities)
const mockPrefetch = jest.mocked(Image.prefetch)

const FIRST_PAGE = RECOMMENDATIONS.slice(0, 10)
const SECOND_PAGE = RECOMMENDATIONS.slice(10, 13)

// ActivityList only renders its first few cards up front, so count the list's data.
function listedTitles(): string[] {
  return screen.UNSAFE_getByType(FlatList).props.data.map((a: { title: string }) => a.title)
}

function typeQuery(text: string) {
  fireEvent.changeText(screen.getByLabelText("Search activities"), text)
}

describe("BrowsePage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPrefetch.mockResolvedValue(true)
  })

  it("shows ten random activities and no page numbers before searching", async () => {
    render(<BrowsePage />)
    await act(async () => {})

    expect(listedTitles()).toHaveLength(10)
    expect(mockSearchActivities).not.toHaveBeenCalled()
    expect(screen.queryByRole("button", { name: "Page 1" })).toBeNull()
  })

  it("lets card taps through while the keyboard is open and dismisses it on scroll", async () => {
    render(<BrowsePage />)
    await act(async () => {})
    const list = screen.UNSAFE_getByType(FlatList)

    expect(list.props.keyboardShouldPersistTaps).toBe("handled")
    expect(list.props.keyboardDismissMode).toBe("on-drag")
  })

  it("shows the first page of results with page numbers for a query", async () => {
    mockSearchActivities.mockResolvedValue({ items: FIRST_PAGE, total: 13 })
    render(<BrowsePage />)

    await act(async () => typeQuery("guitar"))

    expect(mockSearchActivities).toHaveBeenCalledWith("guitar", { offset: 0, limit: 10 })
    expect(listedTitles()).toEqual(FIRST_PAGE.map((a) => a.title))
    expect(screen.getByRole("button", { name: "Page 2" })).toBeTruthy()
  })

  it("replaces the results when another page is chosen", async () => {
    mockSearchActivities
      .mockResolvedValueOnce({ items: FIRST_PAGE, total: 13 })
      .mockResolvedValueOnce({ items: SECOND_PAGE, total: 13 })
    render(<BrowsePage />)

    await act(async () => typeQuery("a"))
    await act(async () => fireEvent.press(screen.getByRole("button", { name: "Page 2" })))

    expect(mockSearchActivities).toHaveBeenLastCalledWith("a", { offset: 10, limit: 10 })
    expect(listedTitles()).toEqual(SECOND_PAGE.map((a) => a.title))
  })

  it("hides page numbers when results fit on one page", async () => {
    mockSearchActivities.mockResolvedValue({ items: SECOND_PAGE, total: 3 })
    render(<BrowsePage />)

    await act(async () => typeQuery("guitar"))

    expect(screen.queryByRole("button", { name: "Page 1" })).toBeNull()
  })

  it("shows a no-results message when nothing matches", async () => {
    mockSearchActivities.mockResolvedValue({ items: [], total: 0 })
    render(<BrowsePage />)

    await act(async () => typeQuery("  zzz "))

    expect(screen.getByText("No activities match “zzz”")).toBeTruthy()
  })

  it("prefetches the first three images before showing a page", async () => {
    let finishPrefetch: (loaded: boolean) => void = () => {}
    mockSearchActivities.mockResolvedValue({ items: FIRST_PAGE, total: 10 })
    render(<BrowsePage />)
    await act(async () => {})
    mockPrefetch.mockReturnValueOnce(new Promise((resolve) => (finishPrefetch = resolve)))

    await act(async () => typeQuery("guitar"))

    expect(mockPrefetch).toHaveBeenLastCalledWith(
      FIRST_PAGE.slice(0, 3).map((a) => a.imageUrl),
      "memory-disk",
    )
    expect(listedTitles()).toEqual([])

    await act(async () => finishPrefetch(true))
    expect(listedTitles()).toEqual(FIRST_PAGE.map((a) => a.title))
  })

  it("shows the page anyway if the images take longer than the timeout", async () => {
    jest.useFakeTimers()
    try {
      mockSearchActivities.mockResolvedValue({ items: FIRST_PAGE, total: 10 })
      render(<BrowsePage />)
      await act(async () => {})
      mockPrefetch.mockReturnValueOnce(new Promise(() => {}))

      await act(async () => typeQuery("guitar"))
      expect(listedTitles()).toEqual([])

      await act(async () => jest.advanceTimersByTime(1500))
      expect(listedTitles()).toEqual(FIRST_PAGE.map((a) => a.title))
    } finally {
      jest.useRealTimers()
    }
  })

  it("waits for the random set's images before showing it", async () => {
    let finishPrefetch: (loaded: boolean) => void = () => {}
    mockPrefetch.mockReturnValueOnce(new Promise((resolve) => (finishPrefetch = resolve)))
    render(<BrowsePage />)

    expect(listedTitles()).toEqual([])
    await act(async () => finishPrefetch(true))
    expect(listedTitles()).toHaveLength(10)
  })

  it("ignores a response that arrives after a newer query", async () => {
    let resolveStale: (page: BrowseApi.SearchPage) => void = () => {}
    mockSearchActivities
      .mockReturnValueOnce(new Promise((resolve) => (resolveStale = resolve)))
      .mockResolvedValueOnce({ items: SECOND_PAGE, total: 3 })
    render(<BrowsePage />)

    await act(async () => typeQuery("gu"))
    await act(async () => typeQuery("guitar"))
    await act(async () => resolveStale({ items: FIRST_PAGE, total: 13 }))

    expect(listedTitles()).toEqual(SECOND_PAGE.map((a) => a.title))
  })
})
