import { act, fireEvent, render, screen } from "@testing-library/react-native"

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), dismissTo: jest.fn(), back: jest.fn(), canGoBack: jest.fn(() => true) },
}))

jest.mock("@/lib/onboarding/api", () => ({
  updatePreferences: jest.fn(),
}))

jest.mock("lucide-react-native", () => require("@/test-utils/mocks").lucideMock)

jest.mock("react-native-safe-area-context", () => require("@/test-utils/mocks").safeAreaMock)

import * as ExpoRouter from "expo-router"

import PreferencesMotivationScreen from "@/app/(authed)/preferences/motivation"
import { UnauthenticatedError } from "@/lib/auth/errors"
import * as Api from "@/lib/onboarding/api"
import { OnboardingProvider } from "@/lib/onboarding/context"
import { ONBOARDING_DEFAULT_VALUES } from "@/lib/onboarding/options"
import { getCachedPatternWeights, setCachedPatternWeights } from "@/lib/patterns/cache"
import { getRecommendationsGeneration } from "@/lib/recommendations/recommendation-store"
import { MOCK_USER_BFAS } from "@touchgrass/mocks/user"
import type { UserPatternWeights } from "@touchgrass/types"
import { MOTIVATION_OPTIONS } from "@touchgrass/types/constants"

const mockUpdatePreferences = jest.mocked(Api.updatePreferences)
const mockDismissTo = jest.mocked(ExpoRouter.router.dismissTo)
const mockReplace = jest.mocked(ExpoRouter.router.replace)

const [firstOption, secondOption] = MOTIVATION_OPTIONS

function renderWithSaved(motivations: string[]) {
  render(
    <OnboardingProvider
      defaultValues={{
        ...ONBOARDING_DEFAULT_VALUES,
        interests: ["Music"],
        personality: MOCK_USER_BFAS,
        motivations,
      }}
    >
      <PreferencesMotivationScreen />
    </OnboardingProvider>,
  )
}

async function save() {
  await act(async () => {
    fireEvent.press(screen.getByRole("button", { name: /Save changes|Saving/ }))
  })
}

describe("PreferencesMotivationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows the saved motivations as selected", () => {
    renderWithSaved([firstOption.value])

    expect(screen.getByRole("checkbox", { name: firstOption.label })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: secondOption.label })).not.toBeChecked()
  })

  it("disables saving when no motivation is selected", () => {
    renderWithSaved([firstOption.value])

    fireEvent.press(screen.getByRole("checkbox", { name: firstOption.label }))

    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled()
  })

  it("saves all three preferences and returns to recommendations", async () => {
    mockUpdatePreferences.mockResolvedValue()
    renderWithSaved([firstOption.value])

    fireEvent.press(screen.getByRole("checkbox", { name: secondOption.label }))
    await save()

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      interests: ["Music"],
      personality: MOCK_USER_BFAS,
      motivations: [firstOption.value, secondOption.value],
    })
    expect(mockDismissTo).toHaveBeenCalledWith("/recommendations")
  })

  it("clears the cached recommendations after saving", async () => {
    mockUpdatePreferences.mockResolvedValue()
    setCachedPatternWeights({ "1-HH": 1 } as UserPatternWeights)
    const generationBefore = getRecommendationsGeneration()
    renderWithSaved([firstOption.value])

    await save()

    expect(getCachedPatternWeights()).toBeUndefined()
    expect(getRecommendationsGeneration()).toBe(generationBefore + 1)
  })

  it("keeps the cached recommendations when saving fails", async () => {
    mockUpdatePreferences.mockRejectedValue(new Error("Failed to update preferences (500)"))
    setCachedPatternWeights({ "1-HH": 1 } as UserPatternWeights)
    const generationBefore = getRecommendationsGeneration()
    renderWithSaved([firstOption.value])

    await save()

    expect(getCachedPatternWeights()).toBeDefined()
    expect(getRecommendationsGeneration()).toBe(generationBefore)
  })

  it("stays on the screen with an error when saving fails", async () => {
    mockUpdatePreferences.mockRejectedValue(new Error("Failed to update preferences (500)"))
    renderWithSaved([firstOption.value])

    await save()

    expect(mockDismissTo).not.toHaveBeenCalled()
    expect(screen.getByText("Couldn't save your changes. Try again.")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled()
  })

  it("sends a signed-out user to sign-in", async () => {
    mockUpdatePreferences.mockRejectedValue(new UnauthenticatedError())
    renderWithSaved([firstOption.value])

    await save()

    expect(mockReplace).toHaveBeenCalledWith("/sign-in")
    expect(mockDismissTo).not.toHaveBeenCalled()
  })
})
