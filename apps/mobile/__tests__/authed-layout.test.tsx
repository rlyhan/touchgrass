import { render, screen } from "@testing-library/react-native"
import { ActivityIndicator } from "react-native"

const mockUseSession = jest.fn()

jest.mock("@/lib/auth/client", () => ({
  useSession: () => mockUseSession(),
}))

jest.mock("expo-router", () => {
  const { Text } = require("react-native")
  return {
    Redirect: ({ href }: { href: string }) => (
      <Text testID="redirect">{String(href)}</Text>
    ),
    Stack: () => <Text testID="stack">stack</Text>,
  }
})

import AuthedLayout from "@/app/(authed)/_layout"

describe("(authed) layout gate", () => {
  beforeEach(() => {
    mockUseSession.mockReset()
  })

  it("shows a spinner while the session is pending", () => {
    mockUseSession.mockReturnValue({ data: undefined, isPending: true })
    const tree = render(<AuthedLayout />)
    expect(tree.UNSAFE_getByType(ActivityIndicator)).toBeTruthy()
    expect(screen.queryByTestId("redirect")).toBeNull()
    expect(screen.queryByTestId("stack")).toBeNull()
  })

  it("redirects to /onboarding/name when there is no session", () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false })
    render(<AuthedLayout />)
    expect(screen.getByTestId("redirect").props.children).toBe(
      "/onboarding/name",
    )
    expect(screen.queryByTestId("stack")).toBeNull()
  })

  it("renders the Stack when the user is signed in", () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: "u1" } },
      isPending: false,
    })
    render(<AuthedLayout />)
    expect(screen.getByTestId("stack")).toBeTruthy()
    expect(screen.queryByTestId("redirect")).toBeNull()
  })
})
