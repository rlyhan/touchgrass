import { Pressable, Text, type PressableProps } from "react-native"
import type { LucideIcon } from "lucide-react-native"

import { colors } from "@/lib/theme/colors"

type Props = Pick<
  PressableProps,
  "onPress" | "accessibilityRole" | "accessibilityLabel" | "accessibilityState"
> & {
  label: string
  active: boolean
  size?: "sm" | "md"
  leadingIcon?: LucideIcon
  trailingIcon?: LucideIcon
}

const SIZE_STYLES = {
  sm: {
    container: "gap-1.5 rounded-full py-1.5 pl-3",
    paddingRight: { withTrailing: "pr-2", withoutTrailing: "pr-3" },
    text: "text-sm",
    iconSize: 14,
  },
  md: {
    container: "gap-2 rounded-2xl py-2 pl-4",
    paddingRight: { withTrailing: "pr-2", withoutTrailing: "pr-4" },
    text: "text-base",
    iconSize: 18,
  },
} as const

export function Pill({
  label,
  active,
  size = "md",
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  ...pressableProps
}: Props) {
  const styles = SIZE_STYLES[size]
  const iconColor = active ? colors.white : colors.gray[600]

  return (
    <Pressable
      {...pressableProps}
      className={`flex-row items-center self-start ${styles.container} ${
        TrailingIcon ? styles.paddingRight.withTrailing : styles.paddingRight.withoutTrailing
      } ${active ? "bg-emerald-800" : "bg-gray-100"}`}
    >
      {LeadingIcon ? <LeadingIcon size={styles.iconSize} color={iconColor} /> : null}
      <Text className={`${styles.text} ${active ? "text-white" : "text-gray-700"}`}>{label}</Text>
      {TrailingIcon ? <TrailingIcon size={styles.iconSize} color={iconColor} /> : null}
    </Pressable>
  )
}
