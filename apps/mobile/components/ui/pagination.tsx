import { ChevronLeft, ChevronRight } from "lucide-react-native"
import { Pressable, Text, View } from "react-native"

import { colors } from "@/lib/theme/colors"

const MAX_VISIBLE_PAGES = 5

type Props = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function getVisiblePages(page: number, pageCount: number): number[] {
  const count = Math.min(MAX_VISIBLE_PAGES, pageCount)
  const start = Math.min(Math.max(1, page - Math.floor(count / 2)), pageCount - count + 1)
  return Array.from({ length: count }, (_, i) => start + i)
}

function ArrowButton({
  direction,
  disabled,
  onPress,
}: {
  direction: "previous" | "next"
  disabled: boolean
  onPress: () => void
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${direction === "previous" ? "Previous" : "Next"} page`}
      accessibilityState={{ disabled }}
      className="h-10 w-10 items-center justify-center rounded-full"
    >
      <Icon size={20} color={disabled ? colors.gray[200] : colors.gray[600]} />
    </Pressable>
  )
}

export function Pagination({ page, pageCount, onPageChange }: Props) {
  return (
    <View className="flex-row items-center justify-center gap-1">
      <ArrowButton
        direction="previous"
        disabled={page <= 1}
        onPress={() => onPageChange(page - 1)}
      />
      {getVisiblePages(page, pageCount).map((pageNumber) => {
        const selected = pageNumber === page
        return (
          <Pressable
            key={pageNumber}
            onPress={() => onPageChange(pageNumber)}
            disabled={selected}
            accessibilityRole="button"
            accessibilityLabel={`Page ${pageNumber}`}
            accessibilityState={{ selected }}
            className={`h-10 w-10 items-center justify-center rounded-full ${
              selected ? "bg-emerald-500" : "border border-gray-200 bg-white"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${selected ? "text-white" : "text-gray-700"}`}
            >
              {pageNumber}
            </Text>
          </Pressable>
        )
      })}
      <ArrowButton
        direction="next"
        disabled={page >= pageCount}
        onPress={() => onPageChange(page + 1)}
      />
    </View>
  )
}
