import { ChevronDown, ChevronUp } from "lucide-react-native"

import { Pill } from "@/components/ui/pill"

type Props = {
  label: string
  open: boolean
  onToggle: () => void
}

export function FilterButton({ label, open, onToggle }: Props) {
  return (
    <Pill
      label={label}
      active={open}
      trailingIcon={open ? ChevronUp : ChevronDown}
      onPress={onToggle}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
    />
  )
}
