import { fireEvent, render, screen } from "@testing-library/react-native"

jest.mock("expo-haptics", () => ({ selectionAsync: jest.fn() }))

jest.mock("lucide-react-native", () => require("@/test-utils/mocks").lucideMock)

const mockInsets = { top: 0, right: 0, bottom: 0, left: 0 }

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => mockInsets,
}))

import * as Haptics from "expo-haptics"

import { BottomNav } from "@/components/navigation/bottom-nav"

const mockSelectionAsync = jest.mocked(Haptics.selectionAsync)

describe("BottomNav", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockInsets.bottom = 0
  })

  it("renders a labelled tab for Home and Browse", () => {
    render(<BottomNav activeTab="home" onTabPress={jest.fn()} />)

    expect(screen.getByRole("tab", { name: "Home" })).toBeTruthy()
    expect(screen.getByRole("tab", { name: "Browse" })).toBeTruthy()
    expect(screen.getByTestId("home-icon")).toBeTruthy()
    expect(screen.getByTestId("search-icon")).toBeTruthy()
  })

  it("marks only the active tab as selected", () => {
    render(<BottomNav activeTab="browse" onTabPress={jest.fn()} />)

    expect(screen.getByRole("tab", { name: "Browse" })).toBeSelected()
    expect(screen.getByRole("tab", { name: "Home" })).not.toBeSelected()
  })

  it("reports the pressed tab and gives haptic feedback", () => {
    const onTabPress = jest.fn()
    render(<BottomNav activeTab="home" onTabPress={onTabPress} />)

    fireEvent.press(screen.getByRole("tab", { name: "Browse" }))

    expect(onTabPress).toHaveBeenCalledWith("browse")
    expect(mockSelectionAsync).toHaveBeenCalledTimes(1)
  })

  it("ignores presses on the tab that is already active", () => {
    const onTabPress = jest.fn()
    render(<BottomNav activeTab="home" onTabPress={onTabPress} />)

    fireEvent.press(screen.getByRole("tab", { name: "Home" }))

    expect(onTabPress).not.toHaveBeenCalled()
    expect(mockSelectionAsync).not.toHaveBeenCalled()
  })

  it("pads the bar above the home indicator", () => {
    mockInsets.bottom = 34
    render(<BottomNav activeTab="home" onTabPress={jest.fn()} />)

    expect(screen.getByTestId("bottom-nav")).toHaveStyle({ paddingBottom: 34 })
  })

  it("keeps a minimum bottom padding on devices without an inset", () => {
    render(<BottomNav activeTab="home" onTabPress={jest.fn()} />)

    expect(screen.getByTestId("bottom-nav")).toHaveStyle({ paddingBottom: 8 })
  })
})
