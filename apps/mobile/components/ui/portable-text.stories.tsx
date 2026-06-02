import type { PortableTextBlock } from "@portabletext/types"
import type { Meta, StoryObj } from "@storybook/react-native"

import { PortableText } from "./portable-text"

function paragraph(
  key: string,
  spans: { text: string; marks?: string[] }[],
): PortableTextBlock {
  return {
    _type: "block",
    _key: key,
    children: spans.map((span, idx) => ({
      _type: "span",
      _key: `${key}-${idx}`,
      text: span.text,
      marks: span.marks ?? [],
    })),
  } as PortableTextBlock
}

const blocks: PortableTextBlock[] = [
  paragraph("a", [
    { text: "Sourdough baking " },
    { text: "rewards patience", marks: ["strong"] },
    { text: " more than precision. Start with a healthy starter and a " },
    { text: "long, slow ferment", marks: ["em"] },
    { text: "." },
  ]),
  paragraph("b", [
    {
      text: "Your first loaf will not be perfect, and that is exactly the point — each bake teaches you something about timing and feel.",
    },
  ]),
]

const meta = {
  title: "UI/PortableText",
  component: PortableText,
  args: {
    blocks,
  },
} satisfies Meta<typeof PortableText>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleParagraph: Story = {
  args: {
    blocks: [
      paragraph("only", [
        { text: "A short, single paragraph of body copy." },
      ]),
    ],
  },
}

export const DarkerText: Story = {
  args: {
    paragraphClassName: "mb-4 leading-relaxed text-gray-900",
  },
}

export const Empty: Story = {
  args: {
    blocks: [],
  },
}
