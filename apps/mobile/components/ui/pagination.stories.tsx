import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-native"
import { fn } from "storybook/test"

import { Pagination } from "./pagination"

const meta = {
  title: "UI/Pagination",
  component: Pagination,
  args: {
    page: 1,
    pageCount: 3,
    onPageChange: fn(),
  },
  argTypes: {
    page: { control: { type: "number", min: 1 } },
    pageCount: { control: { type: "number", min: 1 } },
  },
} satisfies Meta<typeof Pagination>

export default meta

type Story = StoryObj<typeof meta>

export const FewPages: Story = {}

export const ManyPagesMiddle: Story = {
  args: { page: 7, pageCount: 20 },
}

export const LastPage: Story = {
  args: { page: 20, pageCount: 20 },
}

function InteractivePagination() {
  const [page, setPage] = useState(1)
  return <Pagination page={page} pageCount={12} onPageChange={setPage} />
}

export const Interactive: Story = {
  render: () => <InteractivePagination />,
}
