import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { ActivityIndicator } from "react-native"

jest.mock("expo-router", () => {
  const { Text } = require("react-native")
  return {
    router: { replace: jest.fn() },
    Redirect: ({ href }: { href: string }) => <Text testID="redirect">{String(href)}</Text>,
    Stack: () => <Text testID="stack">stack</Text>,
  }
})

jest.mock("@/lib/onboarding/api", () => ({
  fetchProfilePreferences: jest.fn(),
}))

import * as ExpoRouter from "expo-router"

import PreferencesLayout from "@/app/(authed)/preferences/_layout"
import { UnauthenticatedError } from "@/lib/auth/errors"
import * as Api from "@/lib/onboarding/api"
import type { ProfilePreferences } from "@/lib/onboarding/api"
import { ONBOARDING_ROUTES } from "@/lib/onboarding/routes"
import { MOCK_USER_BFAS } from "@touchgrass/mocks/user"

const mockFetchPreferences = jest.mocked(Api.fetchProfilePreferences)
const mockReplace = jest.mocked(ExpoRouter.router.replace)

const savedPreferences: ProfilePreferences = {
  interests: ["Music"],
  personality: MOCK_USER_BFAS,
  motivations: ["explore_creative"],
}

async function renderLayout() {
  render(<PreferencesLayout />)
  await act(async () => {})
}

describe("PreferencesLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows a spinner while the preferences load", () => {
    mockFetchPreferences.mockReturnValue(new Promise(() => {}))
    render(<PreferencesLayout />)

    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy()
    expect(screen.queryByTestId("stack")).toBeNull()
  })

  it("renders the edit flow once the preferences load", async () => {
    mockFetchPreferences.mockResolvedValue(savedPreferences)
    await renderLayout()

    expect(screen.getByTestId("stack")).toBeTruthy()
  })

  it("sends a user without a profile to onboarding", async () => {
    mockFetchPreferences.mockResolvedValue(null)
    await renderLayout()

    expect(screen.getByTestId("redirect").props.children).toBe(ONBOARDING_ROUTES.basicDetails)
  })

  it("sends a signed-out user to sign-in", async () => {
    mockFetchPreferences.mockRejectedValue(new UnauthenticatedError())
    await renderLayout()

    expect(mockReplace).toHaveBeenCalledWith("/sign-in")
  })

  it("retries loading after an error", async () => {
    mockFetchPreferences.mockRejectedValueOnce(new Error("Failed to load profile (500)"))
    mockFetchPreferences.mockResolvedValueOnce(savedPreferences)
    await renderLayout()

    expect(screen.getByText("Couldn't load your preferences.")).toBeTruthy()

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Try again" }))
    })

    expect(mockFetchPreferences).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId("stack")).toBeTruthy()
  })
})
