import { act, fireEvent, render, screen } from "@testing-library/react-native"

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}))

jest.mock("@/lib/auth/client", () => ({
  signOut: jest.fn(),
  useSession: jest.fn(),
}))

jest.mock("@/lib/patterns/cache", () => ({
  clearPatternWeightsCache: jest.fn(),
}))

import * as Auth from "@/lib/auth/client"
import * as PatternsCache from "@/lib/patterns/cache"
import * as ExpoRouter from "expo-router"

import { AuthButton } from "@/components/auth/auth-button"

const mockSignOut = jest.mocked(Auth.signOut)
const mockUseSession = jest.mocked(Auth.useSession)
const mockClearCache = jest.mocked(PatternsCache.clearPatternWeightsCache)
const mockPush = jest.mocked(ExpoRouter.router.push)
const mockReplace = jest.mocked(ExpoRouter.router.replace)

function signedIn() {
  mockUseSession.mockReturnValue({
    data: { user: { id: "u1" } },
    isPending: false,
  } as unknown as ReturnType<typeof Auth.useSession>)
}

async function pressSignOut() {
  await act(async () => fireEvent.press(screen.getByRole("button", { name: "Sign out" })))
}

describe("AuthButton", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("signs out, clears cached weights and goes to sign-in", async () => {
    signedIn()
    mockSignOut.mockResolvedValue({ data: { success: true }, error: null } as never)
    render(<AuthButton />)

    await pressSignOut()

    expect(mockClearCache).toHaveBeenCalled()
    expect(mockReplace).toHaveBeenCalledWith("/sign-in")
    expect(screen.queryByText("Couldn't sign out. Try again.")).toBeNull()
  })

  it("stays on the page with a retry message when the request fails", async () => {
    signedIn()
    mockSignOut.mockRejectedValue(new TypeError("Network request failed"))
    render(<AuthButton />)

    await pressSignOut()

    expect(mockReplace).not.toHaveBeenCalled()
    expect(mockClearCache).not.toHaveBeenCalled()
    expect(screen.getByText("Couldn't sign out. Try again.")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Sign out" })).toBeEnabled()
  })

  it("stays on the page with a retry message when the server returns an error", async () => {
    signedIn()
    mockSignOut.mockResolvedValue({ data: null, error: { status: 500 } } as never)
    render(<AuthButton />)

    await pressSignOut()

    expect(mockReplace).not.toHaveBeenCalled()
    expect(screen.getByText("Couldn't sign out. Try again.")).toBeTruthy()
  })

  it("pushes sign-in when signed out", () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false } as unknown as ReturnType<
      typeof Auth.useSession
    >)
    render(<AuthButton />)

    fireEvent.press(screen.getByRole("button", { name: "Sign in" }))

    expect(mockPush).toHaveBeenCalledWith("/sign-in")
    expect(mockSignOut).not.toHaveBeenCalled()
  })
})
