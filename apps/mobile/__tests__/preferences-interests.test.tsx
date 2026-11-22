import { fireEvent, render, screen } from "@testing-library/react-native"

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
}))

jest.mock("lucide-react-native", () => require("@/test-utils/mocks").lucideMock)

jest.mock("react-native-safe-area-context", () => require("@/test-utils/mocks").safeAreaMock)

import * as ExpoRouter from "expo-router"

import PreferencesInterestsScreen from "@/app/(authed)/preferences/interests"
import { OnboardingProvider } from "@/lib/onboarding/context"
import { ONBOARDING_DEFAULT_VALUES } from "@/lib/onboarding/options"
import { PREFERENCES_ROUTES } from "@/lib/preferences/routes"
import type { ActivityField } from "@touchgrass/types"
import { ACTIVITY_FIELDS } from "@touchgrass/types/constants"

const mockPush = jest.mocked(ExpoRouter.router.push)

const [savedField, otherField] = ACTIVITY_FIELDS

function renderWithSaved(interests: ActivityField[]) {
  render(
    <OnboardingProvider defaultValues={{ ...ONBOARDING_DEFAULT_VALUES, interests }}>
      <PreferencesInterestsScreen />
    </OnboardingProvider>,
  )
}

describe("PreferencesInterestsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows the saved interests as selected", () => {
    renderWithSaved([savedField])

    expect(screen.getByRole("togglebutton", { name: savedField })).toBeSelected()
    expect(screen.getByRole("togglebutton", { name: otherField })).not.toBeSelected()
  })

  it("continues to the personality step", () => {
    renderWithSaved([savedField])

    fireEvent.press(screen.getByRole("button", { name: "Continue" }))

    expect(mockPush).toHaveBeenCalledWith(PREFERENCES_ROUTES.personality)
  })
})
