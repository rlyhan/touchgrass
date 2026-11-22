import RNSlider from "@react-native-community/slider"
import { fireEvent, render, screen } from "@testing-library/react-native"

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
}))

jest.mock("lucide-react-native", () => require("@/test-utils/mocks").lucideMock)

jest.mock("react-native-safe-area-context", () => require("@/test-utils/mocks").safeAreaMock)

import * as ExpoRouter from "expo-router"

import PreferencesPersonalityScreen from "@/app/(authed)/preferences/personality"
import { OnboardingProvider } from "@/lib/onboarding/context"
import { ONBOARDING_DEFAULT_VALUES } from "@/lib/onboarding/options"
import { PREFERENCES_ROUTES } from "@/lib/preferences/routes"
import { MOCK_USER_BFAS } from "@touchgrass/mocks/user"
import { BFAS_TRAITS } from "@touchgrass/types/constants"

const mockPush = jest.mocked(ExpoRouter.router.push)

function renderWithSaved() {
  render(
    <OnboardingProvider defaultValues={{ ...ONBOARDING_DEFAULT_VALUES, personality: MOCK_USER_BFAS }}>
      <PreferencesPersonalityScreen />
    </OnboardingProvider>,
  )
}

describe("PreferencesPersonalityScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("starts each slider at the saved score", () => {
    renderWithSaved()

    const sliderValues = screen.UNSAFE_getAllByType(RNSlider).map((slider) => slider.props.value)

    expect(sliderValues).toEqual(BFAS_TRAITS.map((trait) => MOCK_USER_BFAS[trait.key]))
  })

  it("continues to the motivation step", () => {
    renderWithSaved()

    fireEvent.press(screen.getByRole("button", { name: "Continue" }))

    expect(mockPush).toHaveBeenCalledWith(PREFERENCES_ROUTES.motivation)
  })
})
