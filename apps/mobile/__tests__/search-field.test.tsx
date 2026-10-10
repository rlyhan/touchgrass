import { fireEvent, render, screen } from "@testing-library/react-native"

jest.mock("lucide-react-native", () => require("@/test-utils/mocks").lucideMock)

import { SearchField } from "@/components/ui/search-field"

describe("SearchField", () => {
  it("forwards typing and uses the label as the placeholder", () => {
    const onChangeText = jest.fn()
    render(<SearchField label="Search activities" value="" onChangeText={onChangeText} />)

    const input = screen.getByLabelText("Search activities")
    expect(input.props.placeholder).toBe("Search activities")

    fireEvent.changeText(input, "gu")
    expect(onChangeText).toHaveBeenCalledWith("gu")
  })

  it("hides the clear button when empty", () => {
    render(<SearchField label="Search activities" value="" onChangeText={jest.fn()} />)

    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull()
  })

  it("clears the query when the clear button is pressed", () => {
    const onChangeText = jest.fn()
    render(<SearchField label="Search activities" value="guitar" onChangeText={onChangeText} />)

    fireEvent.press(screen.getByRole("button", { name: "Clear search" }))
    expect(onChangeText).toHaveBeenCalledWith("")
  })
})
