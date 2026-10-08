import { fireEvent, render, screen } from "@testing-library/react-native"

jest.mock("lucide-react-native", () => {
  const { View } = require("react-native")
  return { ChevronLeft: () => <View />, ChevronRight: () => <View /> }
})

import { getVisiblePages, Pagination } from "@/components/ui/pagination"

describe("getVisiblePages", () => {
  it("shows every page when there are five or fewer", () => {
    expect(getVisiblePages(1, 3)).toEqual([1, 2, 3])
  })

  it("centres the window on the current page", () => {
    expect(getVisiblePages(7, 20)).toEqual([5, 6, 7, 8, 9])
  })

  it("clamps the window at the start and end", () => {
    expect(getVisiblePages(1, 20)).toEqual([1, 2, 3, 4, 5])
    expect(getVisiblePages(20, 20)).toEqual([16, 17, 18, 19, 20])
  })
})

describe("Pagination", () => {
  it("calls onPageChange with the pressed page and arrow targets", () => {
    const onPageChange = jest.fn()
    render(<Pagination page={2} pageCount={4} onPageChange={onPageChange} />)

    fireEvent.press(screen.getByRole("button", { name: "Page 3" }))
    fireEvent.press(screen.getByRole("button", { name: "Previous page" }))
    fireEvent.press(screen.getByRole("button", { name: "Next page" }))

    expect(onPageChange.mock.calls).toEqual([[3], [1], [3]])
  })

  it("disables the previous arrow on the first page and next on the last", () => {
    const { rerender } = render(<Pagination page={1} pageCount={2} onPageChange={jest.fn()} />)
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled()

    rerender(<Pagination page={2} pageCount={2} onPageChange={jest.fn()} />)
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled()
  })
})
