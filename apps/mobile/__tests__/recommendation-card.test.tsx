import { fireEvent, render, screen } from "@testing-library/react-native"

// ── native deps ───────────────────────────────────────────────────────────────
// We mock expo-image so we can drive its onError handler from the test.
jest.mock("expo-image", () => {
  const { Pressable } = require("react-native")
  return {
    Image: ({ onError }: { onError?: () => void }) => (
      <Pressable testID="card-image" onPress={() => onError?.()} />
    ),
  }
})

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native")
  return {
    LinearGradient: (p: object) => <View {...p} />,
  }
})

// Mock the icons module so we can verify the right lookups happen and so we
// don't have to render real lucide SVGs.
jest.mock("@/lib/icons", () => {
  const { View } = require("react-native")
  const TypeIcon = (p: object) => <View testID="type-icon" {...p} />
  const FieldIcon = (p: object) => <View testID="field-icon" {...p} />
  return {
    TimeIcon: (p: object) => <View testID="time-icon" {...p} />,
    getActivityTypeIcon: jest.fn(() => TypeIcon),
    getFieldIcon: jest.fn(() => FieldIcon),
  }
})

import * as Icons from "@/lib/icons"
import { RecommendationCard } from "@/components/recommendations/recommendation-card"
import { RECOMMENDATIONS } from "@touchgrass/mocks/recommendations"

const mockGetActivityTypeIcon = jest.mocked(Icons.getActivityTypeIcon)
const mockGetFieldIcon = jest.mocked(Icons.getFieldIcon)

const ACTIVITY = RECOMMENDATIONS[0]
const BASE_PROPS = {
  title: ACTIVITY.title,
  imageUrl: ACTIVITY.imageUrl,
  type: ACTIVITY.type,
  field: ACTIVITY.field,
  estimatedTime: ACTIVITY.estimated_time,
}

describe("RecommendationCard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the title and the type and field labels", () => {
    render(<RecommendationCard {...BASE_PROPS} />)
    expect(screen.getByText(BASE_PROPS.title)).toBeTruthy()
    expect(screen.getByText(BASE_PROPS.type)).toBeTruthy()
    expect(screen.getByText(BASE_PROPS.field)).toBeTruthy()
  })

  it("renders the estimated-time row when provided", () => {
    render(<RecommendationCard {...BASE_PROPS} />)
    expect(screen.getByText(BASE_PROPS.estimatedTime!)).toBeTruthy()
    expect(screen.getByTestId("time-icon")).toBeTruthy()
  })

  it("omits the estimated-time row when not provided", () => {
    render(<RecommendationCard {...BASE_PROPS} estimatedTime={undefined} />)
    expect(screen.queryByText(BASE_PROPS.estimatedTime!)).toBeNull()
    expect(screen.queryByTestId("time-icon")).toBeNull()
  })

  it("looks up icons via the activity type and field", () => {
    render(<RecommendationCard {...BASE_PROPS} />)
    expect(mockGetActivityTypeIcon).toHaveBeenCalledWith(BASE_PROPS.type)
    expect(mockGetFieldIcon).toHaveBeenCalledWith(BASE_PROPS.field)
    expect(screen.getByTestId("type-icon")).toBeTruthy()
    expect(screen.getByTestId("field-icon")).toBeTruthy()
  })

  it("swaps the image for a fallback view when the image errors", () => {
    render(<RecommendationCard {...BASE_PROPS} />)
    expect(screen.getByTestId("card-image")).toBeTruthy()

    fireEvent.press(screen.getByTestId("card-image"))

    expect(screen.queryByTestId("card-image")).toBeNull()
  })
})
