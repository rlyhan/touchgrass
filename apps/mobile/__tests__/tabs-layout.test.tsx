import { fireEvent, render, screen } from "@testing-library/react-native"
import type { ReactNode } from "react"

jest.mock("expo-haptics", () => ({ selectionAsync: jest.fn() }))

jest.mock("lucide-react-native", () => require("@/test-utils/mocks").lucideMock)

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}))

const mockNavigate = jest.fn()
const mockTabState = { index: 0, routes: [{ name: "recommendations/index" }, { name: "browse" }] }

jest.mock("expo-router", () => {
  const { View } = require("react-native")
  function Tabs({ tabBar }: { tabBar: (props: object) => ReactNode }) {
    return <View>{tabBar({ state: mockTabState, navigation: { navigate: mockNavigate } })}</View>
  }
  Tabs.Screen = () => null
  return { Tabs }
})

import TabsLayout from "@/app/(authed)/(tabs)/_layout"

describe("(tabs) layout", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTabState.index = 0
  })

  it("highlights Home while recommendations is focused", () => {
    render(<TabsLayout />)

    expect(screen.getByRole("tab", { name: "Home" })).toBeSelected()
    expect(screen.getByRole("tab", { name: "Browse" })).not.toBeSelected()
  })

  it("highlights Browse while browse is focused", () => {
    mockTabState.index = 1
    render(<TabsLayout />)

    expect(screen.getByRole("tab", { name: "Browse" })).toBeSelected()
  })

  it("navigates to browse from Home", () => {
    render(<TabsLayout />)

    fireEvent.press(screen.getByRole("tab", { name: "Browse" }))

    expect(mockNavigate).toHaveBeenCalledWith("browse")
  })

  it("navigates to recommendations from Browse", () => {
    mockTabState.index = 1
    render(<TabsLayout />)

    fireEvent.press(screen.getByRole("tab", { name: "Home" }))

    expect(mockNavigate).toHaveBeenCalledWith("recommendations/index")
  })
})
