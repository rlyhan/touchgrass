import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { FlatList } from "react-native"

// ── router ────────────────────────────────────────────────────────────────────
jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}))

// ── search api ────────────────────────────────────────────────────────────────
jest.mock("@/lib/browse/api", () => ({
  fetchRandomActivities: jest.fn(),
  searchActivities: jest.fn(),
}))

// ── heavy native deps ─────────────────────────────────────────────────────────
jest.mock("expo-image", () => ({
  Image: { prefetch: jest.fn(() => Promise.resolve(true)) },
}))

jest.mock("lucide-react-native", () => require("@/test-utils/mocks").lucideMock)

jest.mock("react-native-safe-area-context", () => require("@/test-utils/mocks").safeAreaMock)

jest.mock("@/components/icons/grass-logo", () => require("@/test-utils/mocks").grassLogoMock)

jest.mock("@/components/activities/activity-card", () => require("@/test-utils/mocks").activityCardMock)

import * as BrowseApi from "@/lib/browse/api"
import { clearRecommendedSlugs, setRecommendedSlugs } from "@/lib/recommendations/recommended-slugs"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"
import type { Activity } from "@touchgrass/types"
import { Image } from "expo-image"

import BrowsePage from "@/app/(authed)/(tabs)/browse"

const mockSearchActivities = jest.mocked(BrowseApi.searchActivities)
const mockFetchRandomActivities = jest.mocked(BrowseApi.fetchRandomActivities)
const mockPrefetch = jest.mocked(Image.prefetch)

const FIRST_PAGE = RECOMMENDATIONS.slice(0, 10)
const SECOND_PAGE = RECOMMENDATIONS.slice(10, 13)

// ActivityList only renders its first few cards up front, so count the list's data.
function listedTitles(): string[] {
  return screen.UNSAFE_getByType(FlatList).props.data.map((a: { title: string }) => a.title)
}

const SEARCH_DEBOUNCE_MS = 300

function changeSearchText(text: string) {
  fireEvent.changeText(screen.getByLabelText("Search activities"), text)
}

function typeQuery(text: string) {
  changeSearchText(text)
  jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
}

describe("BrowsePage", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockPrefetch.mockResolvedValue(true)
    mockFetchRandomActivities.mockResolvedValue(RECOMMENDATIONS.slice(20, 30))
    clearRecommendedSlugs()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("waits for typing to pause before searching", async () => {
    mockSearchActivities.mockResolvedValue({ items: [], total: 0 })
    render(<BrowsePage />)
    await act(async () => {})

    await act(async () => {
      changeSearchText("g")
      changeSearchText("gu")
      changeSearchText("guitar")
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1)
    })
    expect(mockSearchActivities).not.toHaveBeenCalled()
    expect(screen.queryByText("No activities match “guitar”")).toBeNull()

    await act(async () => jest.advanceTimersByTime(1))
    expect(mockSearchActivities).toHaveBeenCalledTimes(1)
    expect(mockSearchActivities).toHaveBeenCalledWith("guitar", {}, { offset: 0, limit: 10 })
  })

  it("shows ten random activities and no page numbers before searching", async () => {
    render(<BrowsePage />)
    await act(async () => {})

    expect(listedTitles()).toHaveLength(10)
    expect(mockSearchActivities).not.toHaveBeenCalled()
    expect(screen.queryByRole("button", { name: "Page 1" })).toBeNull()
  })

  it("flags only the activities in the user's recommended slugs", async () => {
    const randomActivities = RECOMMENDATIONS.slice(20, 30)
    const recommendedSlugs = [randomActivities[0].slug, randomActivities[3].slug]
    render(<BrowsePage />)
    await act(async () => {})

    await act(async () => setRecommendedSlugs(recommendedSlugs))

    const flaggedSlugs = screen
      .UNSAFE_getByType(FlatList)
      .props.data.filter((a: { recommended: boolean }) => a.recommended)
      .map((a: { slug: string }) => a.slug)
    expect(flaggedSlugs).toEqual(recommendedSlugs)
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

    expect(mockSearchActivities).toHaveBeenCalledWith("guitar", {}, { offset: 0, limit: 10 })
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

    expect(mockSearchActivities).toHaveBeenLastCalledWith("a", {}, { offset: 10, limit: 10 })
    expect(listedTitles()).toEqual(SECOND_PAGE.map((a) => a.title))
  })

  it("hides page numbers when results fit on one page", async () => {
    mockSearchActivities.mockResolvedValue({ items: SECOND_PAGE, total: 3 })
    render(<BrowsePage />)

    await act(async () => typeQuery("guitar"))

    expect(screen.queryByRole("button", { name: "Page 1" })).toBeNull()
  })

  it("searches with the selected filter options and no query", async () => {
    mockSearchActivities.mockResolvedValue({ items: FIRST_PAGE, total: 10 })
    render(<BrowsePage />)
    await act(async () => {})

    await act(async () => fireEvent.press(screen.getByRole("button", { name: "Field" })))
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Music"))
    })
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Art"))
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
    })

    expect(mockSearchActivities).toHaveBeenCalledTimes(1)
    expect(mockSearchActivities).toHaveBeenCalledWith(
      "",
      { field: ["Music", "Art"] },
      { offset: 0, limit: 10 },
    )
    expect(listedTitles()).toEqual(FIRST_PAGE.map((a) => a.title))
  })

  it("returns to random activities when every filter option is cleared", async () => {
    mockSearchActivities.mockResolvedValue({ items: FIRST_PAGE, total: 10 })
    render(<BrowsePage />)
    await act(async () => {})

    await act(async () => fireEvent.press(screen.getByRole("button", { name: "Field" })))
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Music"))
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
    })
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Remove Music filter"))
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
    })

    expect(mockSearchActivities).toHaveBeenCalledTimes(1)
    expect(listedTitles()).toEqual(RECOMMENDATIONS.slice(20, 30).map((a) => a.title))
  })

  it("shows a filter no-results message when only filters are set", async () => {
    mockSearchActivities.mockResolvedValue({ items: [], total: 0 })
    render(<BrowsePage />)
    await act(async () => {})

    await act(async () => fireEvent.press(screen.getByRole("button", { name: "Field" })))
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Music"))
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
    })

    expect(screen.getByText("No activities match the selected filters")).toBeTruthy()
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
    mockSearchActivities.mockResolvedValue({ items: FIRST_PAGE, total: 10 })
    render(<BrowsePage />)
    await act(async () => {})
    mockPrefetch.mockReturnValueOnce(new Promise(() => {}))

    await act(async () => typeQuery("guitar"))
    expect(listedTitles()).toEqual([])

    await act(async () => jest.advanceTimersByTime(1500))
    expect(listedTitles()).toEqual(FIRST_PAGE.map((a) => a.title))
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

describe("BrowsePage filters", () => {
  const directorFilmography: Activity = {
    slug: "watch-a-directors-full-filmography",
    title: "Watch a Director's Full Filmography",
    imageUrl: "https://example.com/filmography.jpg",
    type: "Analytical",
    field: "Film",
    estimated_time: "A month",
  }
  const shortFilm: Activity = {
    slug: "shoot-a-one-minute-short-film",
    title: "Shoot a One-Minute Short Film",
    imageUrl: "https://example.com/short-film.jpg",
    type: "Creative",
    field: "Film",
    estimated_time: "A weekend",
  }
  const oneMinuteSong: Activity = {
    slug: "compose-a-1-minute-song",
    title: "Compose a 1-Minute Song",
    imageUrl: "https://example.com/song.jpg",
    type: "Creative",
    field: "Music",
    estimated_time: "A few hours",
  }
  const coastalHike: Activity = {
    slug: "hike-a-coastal-trail",
    title: "Hike a Coastal Trail",
    imageUrl: "https://example.com/hike.jpg",
    type: "Active",
    field: "Hiking",
    estimated_time: "A day",
  }
  const filterableActivities = [directorFilmography, shortFilm, oneMinuteSong, coastalHike]

  function titlesOf(activities: Activity[]): string[] {
    return activities.map((a) => a.title).sort()
  }

  async function openFilter(name: string) {
    await act(async () => fireEvent.press(screen.getByRole("button", { name })))
  }

  async function pressOption(label: string) {
    await act(async () => {
      fireEvent.press(screen.getByLabelText(label))
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
    })
  }

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    mockPrefetch.mockResolvedValue(true)
    mockFetchRandomActivities.mockResolvedValue(RECOMMENDATIONS.slice(20, 30))
    mockSearchActivities.mockImplementation(async (_query, filters, { offset, limit }) => {
      const matches = filterableActivities.filter(
        (a) =>
          (!filters.type?.length || filters.type.includes(a.type)) &&
          (!filters.field?.length || filters.field.includes(a.field)),
      )
      return { items: matches.slice(offset, offset + limit), total: matches.length }
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("shows every activity whose primary field is Film when Film is selected", async () => {
    render(<BrowsePage />)
    await act(async () => {})

    await openFilter("Field")
    await pressOption("Film")

    expect(listedTitles().sort()).toEqual(titlesOf([directorFilmography, shortFilm]))
  })

  it("shows Film activities first, then Film and Music once Music is added", async () => {
    render(<BrowsePage />)
    await act(async () => {})
    await openFilter("Field")

    await pressOption("Film")
    expect(listedTitles().sort()).toEqual(titlesOf([directorFilmography, shortFilm]))

    await pressOption("Music")
    expect(listedTitles().sort()).toEqual(
      titlesOf([directorFilmography, shortFilm, oneMinuteSong]),
    )
  })

  it("drops Music activities but keeps Film ones when Music is removed", async () => {
    render(<BrowsePage />)
    await act(async () => {})
    await openFilter("Field")
    await pressOption("Film")
    await pressOption("Music")

    await pressOption("Remove Music filter")

    expect(listedTitles().sort()).toEqual(titlesOf([directorFilmography, shortFilm]))
  })

  it("shows only Creative activities from Film and Music when Creative is also selected", async () => {
    render(<BrowsePage />)
    await act(async () => {})
    await openFilter("Field")
    await pressOption("Film")
    await pressOption("Music")
    expect(listedTitles().sort()).toEqual(
      titlesOf([directorFilmography, shortFilm, oneMinuteSong]),
    )

    await openFilter("Activity type")
    await pressOption("Creative")

    expect(listedTitles().sort()).toEqual(titlesOf([shortFilm, oneMinuteSong]))
  })
})
