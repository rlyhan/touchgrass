import { X, type LucideIcon } from "lucide-react-native"

import { Pill } from "@/components/ui/pill"

type Props = {
  label: string
  icon: LucideIcon
  selected: boolean
  onToggle: () => void
}

export function FilterOption({ label, icon, selected, onToggle }: Props) {
  return (
    <Pill
      label={label}
      active={selected}
      size="sm"
      leadingIcon={icon}
      trailingIcon={selected ? X : undefined}
      onPress={onToggle}
      accessibilityRole="togglebutton"
      accessibilityLabel={selected ? `Remove ${label} filter` : label}
      accessibilityState={{ selected }}
    />
  )
}
