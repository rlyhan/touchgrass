import type { Meta, StoryObj } from "@storybook/react-native"

import { RecommendationCard } from "./recommendation-card"

const meta = {
  title: "Recommendations/RecommendationCard",
  component: RecommendationCard,
  args: {
    title: "Beginner sourdough at a neighborhood class",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    type: "Constructive",
    field: "Cooking",
    estimatedTime: "2 hrs",
  },
  argTypes: {
    title: { control: "text" },
    imageUrl: { control: "text" },
    type: { control: "text" },
    field: { control: "text" },
    estimatedTime: { control: "text" },
  },
} satisfies Meta<typeof RecommendationCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outdoorsy: Story = {
  args: {
    title: "Sunset hike on a nearby trail",
    imageUrl:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    type: "Outdoorsy",
    field: "Hiking",
    estimatedTime: "3 hrs",
  },
}

export const Creative: Story = {
  args: {
    title: "Try a 30-minute watercolor warmup",
    imageUrl:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
    type: "Artistic",
    field: "Art",
    estimatedTime: "30 min",
  },
}

export const NoTime: Story = {
  args: {
    estimatedTime: undefined,
  },
}
