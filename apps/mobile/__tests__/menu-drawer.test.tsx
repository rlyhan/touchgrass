import { act, fireEvent, render, screen } from "@testing-library/react-native"
import { Modal } from "react-native"

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}))

jest.mock("@/lib/auth/client", () => ({
  signOut: jest.fn(),
  useSession: jest.fn(),
}))

jest.mock("@/lib/patterns/cache", () => ({
  clearPatternWeightsCache: jest.fn(),
}))

jest.mock("lucide-react-native", () => require("@/test-utils/mocks").lucideMock)

jest.mock("react-native-safe-area-context", () => require("@/test-utils/mocks").safeAreaMock)

import * as Auth from "@/lib/auth/client"
import * as PatternsCache from "@/lib/patterns/cache"
import * as ExpoRouter from "expo-router"

import { MenuDrawer } from "@/components/navigation/menu-drawer"

const mockSignOut = jest.mocked(Auth.signOut)
const mockUseSession = jest.mocked(Auth.useSession)
const mockClearCache = jest.mocked(PatternsCache.clearPatternWeightsCache)
const mockReplace = jest.mocked(ExpoRouter.router.replace)

function sessionWithName(name: string | undefined) {
  mockUseSession.mockReturnValue({
    data: { user: { id: "u1", name } },
    isPending: false,
  } as unknown as ReturnType<typeof Auth.useSession>)
}

async function pressLogOut() {
  await act(async () => {
    fireEvent.press(screen.getByRole("button", { name: /Log out|Logging out/ }))
  })
}

describe("MenuDrawer", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sessionWithName("Ada Lovelace")
  })

  it("renders nothing while closed", () => {
    render(<MenuDrawer visible={false} onClose={jest.fn()} />)

    expect(screen.queryByText("Ada Lovelace")).toBeNull()
    expect(screen.queryByRole("button", { name: "Log out" })).toBeNull()
  })

  it("shows the user's name and a log out action when open", () => {
    render(<MenuDrawer visible onClose={jest.fn()} />)

    expect(screen.getByText("Ada Lovelace")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Log out" })).toBeTruthy()
  })

  it.each([undefined, "", "   "])("omits the heading when the name is %p", (name) => {
    sessionWithName(name)
    render(<MenuDrawer visible onClose={jest.fn()} />)

    expect(screen.queryByTestId("menu-user-name")).toBeNull()
    expect(screen.getByRole("button", { name: "Log out" })).toBeTruthy()
  })

  it("closes from the close button and the backdrop", () => {
    const onClose = jest.fn()
    render(<MenuDrawer visible onClose={onClose} />)

    const [backdrop, closeButton] = screen.getAllByRole("button", { name: "Close menu" })
    fireEvent.press(closeButton)
    fireEvent.press(backdrop)

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it("closes on the Android back button", () => {
    const onClose = jest.fn()
    const tree = render(<MenuDrawer visible onClose={onClose} />)

    fireEvent(tree.UNSAFE_getByType(Modal), "requestClose")

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("logs out, clears cached weights, closes and goes to sign-in", async () => {
    const onClose = jest.fn()
    mockSignOut.mockResolvedValue({ data: { success: true }, error: null } as never)
    render(<MenuDrawer visible onClose={onClose} />)

    await pressLogOut()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockClearCache).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
    expect(mockReplace).toHaveBeenCalledWith("/sign-in")
  })

  it("stays open with a retry message when the request fails", async () => {
    const onClose = jest.fn()
    mockSignOut.mockRejectedValue(new TypeError("Network request failed"))
    render(<MenuDrawer visible onClose={onClose} />)

    await pressLogOut()

    expect(onClose).not.toHaveBeenCalled()
    expect(mockReplace).not.toHaveBeenCalled()
    expect(mockClearCache).not.toHaveBeenCalled()
    expect(screen.getByText("Couldn't log out. Try again.")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Log out" })).toBeEnabled()
  })

  it("stays open with a retry message when the server returns an error", async () => {
    mockSignOut.mockResolvedValue({ data: null, error: { status: 500 } } as never)
    render(<MenuDrawer visible onClose={jest.fn()} />)

    await pressLogOut()

    expect(mockReplace).not.toHaveBeenCalled()
    expect(screen.getByText("Couldn't log out. Try again.")).toBeTruthy()
  })

  it("clears the retry message on the next attempt", async () => {
    mockSignOut.mockRejectedValueOnce(new TypeError("Network request failed"))
    render(<MenuDrawer visible onClose={jest.fn()} />)
    await pressLogOut()

    let resolveSignOut: (value: unknown) => void = () => {}
    mockSignOut.mockReturnValueOnce(new Promise((resolve) => (resolveSignOut = resolve)) as never)
    await pressLogOut()

    expect(screen.queryByText("Couldn't log out. Try again.")).toBeNull()
    await act(async () => resolveSignOut({ data: { success: true }, error: null }))
  })

  it("drops a stale retry message when closed", async () => {
    const onClose = jest.fn()
    mockSignOut.mockRejectedValue(new TypeError("Network request failed"))
    render(<MenuDrawer visible onClose={onClose} />)
    await pressLogOut()

    fireEvent.press(screen.getAllByRole("button", { name: "Close menu" })[1])

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Couldn't log out. Try again.")).toBeNull()
  })

  it("shows progress and ignores repeat presses while logging out", async () => {
    let resolveSignOut: (value: unknown) => void = () => {}
    mockSignOut.mockReturnValue(new Promise((resolve) => (resolveSignOut = resolve)) as never)
    render(<MenuDrawer visible onClose={jest.fn()} />)

    await pressLogOut()

    const button = screen.getByRole("button", { name: "Logging out" })
    expect(screen.getByText("Logging out…")).toBeTruthy()
    expect(button).toBeDisabled()
    await act(async () => {
      fireEvent.press(button)
    })
    expect(mockSignOut).toHaveBeenCalledTimes(1)

    await act(async () => resolveSignOut({ data: { success: true }, error: null }))
    expect(mockReplace).toHaveBeenCalledWith("/sign-in")
  })
})
