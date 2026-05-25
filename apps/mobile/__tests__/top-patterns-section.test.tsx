import { fireEvent, render, screen } from "@testing-library/react-native"

// Replace the animated ring with a simple text stub so we don't have to render
// the SVG or run the reanimated animation in tests.
jest.mock("@/components/patterns/pattern-ring", () => {
  const { Text } = require("react-native")
  return {
    PatternRing: ({ percent, label }: { percent: number; label: string }) => (
      <Text testID="pattern-ring">{`${Math.round(percent)}% ${label}`}</Text>
    ),
  }
})

import { TopPatternsSection } from "@/components/patterns/top-patterns-section"
import type { UserPatternWeights } from "@touchgrass/types"
import { PATTERN_TYPES } from "@touchgrass/types/constants"

function makeWeights(overrides: Partial<UserPatternWeights>): UserPatternWeights {
  const base: Partial<UserPatternWeights> = {}
  for (const p of PATTERN_TYPES) base[p.id] = 0.1
  return { ...base, ...overrides } as UserPatternWeights
}

describe("TopPatternsSection", () => {
  it("renders the heading and subheading copy", () => {
    render(<TopPatternsSection patternWeights={makeWeights({})} />)
    expect(
      screen.getByText("Your highest matching personality patterns."),
    ).toBeTruthy()
    expect(
      screen.getByText("Tap to learn more about each pattern."),
    ).toBeTruthy()
  })

  it("renders rings for the top three patterns ordered by weight desc", () => {
    const weights = makeWeights({
      "4-HH": 0.95, // Enchanting Visionary
      "9-HH": 0.85, // Enlightened Traditionalist
      "1-HH": 0.75, // Personable
      "2-HH": 0.7, // Enterprising — should not appear
    })
    render(<TopPatternsSection patternWeights={weights} />)
    const rings = screen.getAllByTestId("pattern-ring")
    expect(rings).toHaveLength(3)
    expect(rings[0]).toHaveTextContent("95% Enchanting Visionary")
    expect(rings[1]).toHaveTextContent("85% Enlightened Traditionalist")
    expect(rings[2]).toHaveTextContent("75% Personable")
  })

  it("opens a modal with the pattern's short description on tap", () => {
    const weights = makeWeights({ "4-HH": 0.95 })
    render(<TopPatternsSection patternWeights={weights} />)

    // Short description must not be visible until tapped
    const pattern = PATTERN_TYPES.find((p) => p.id === "4-HH")!
    expect(screen.queryByText(pattern.shortDescription)).toBeNull()

    fireEvent.press(
      screen.getByRole("button", { name: `Learn more about ${pattern.name}` }),
    )

    expect(screen.getByText(pattern.shortDescription)).toBeTruthy()

    // Closing dismisses the description
    fireEvent.press(screen.getByRole("button", { name: "Close" }))
    expect(screen.queryByText(pattern.shortDescription)).toBeNull()
  })
})
