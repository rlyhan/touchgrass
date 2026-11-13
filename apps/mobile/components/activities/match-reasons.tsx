import type { ReactNode } from "react"
import { Text, View } from "react-native"

import { PatternIcon } from "@/components/icons/pattern-icon"
import { getFieldIcon } from "@/lib/icons"
import { colors } from "@/lib/theme/colors"
import { PATTERN_COLORS } from "@/lib/theme/pattern-colors"
import type { ActivityField, ActivityType, PatternTypeId, SharedActivityTypesByMotivation } from "@touchgrass/types"
import { MOTIVATION_OPTIONS, PATTERN_TYPES } from "@touchgrass/types/constants"

// "Why this matches you" on the activity page: square boxes for the matched pattern and the user's interest field,
// then a row per shared motivation and one for the activity's type when the recommendations screen picked it for variety.

const PATTERN_BY_ID = Object.fromEntries(PATTERN_TYPES.map((p) => [p.id, p]))

type Props = {
  patternId?: PatternTypeId
  sharedActivityTypesByMotivation?: SharedActivityTypesByMotivation
  varietyType?: ActivityType
  interestField?: ActivityField
}

const PATTERN_BOX_TINT_ALPHA = "1A"

function ReasonBox({
  icon,
  label,
  backgroundColor,
  labelColor,
  testID,
}: {
  icon: ReactNode
  label: string
  backgroundColor: string
  labelColor: string
  testID: string
}) {
  return (
    <View
      testID={testID}
      className="h-24 w-24 items-center justify-center rounded-2xl p-2"
      style={{ backgroundColor }}
    >
      {icon}
      <Text className="mt-2 text-center text-xs font-semibold" style={{ color: labelColor }} numberOfLines={2}>
        {label}
      </Text>
    </View>
  )
}

export function MatchReasons({ patternId, sharedActivityTypesByMotivation = {}, varietyType, interestField }: Props) {
  const pattern = patternId ? PATTERN_BY_ID[patternId] : undefined
  const motivations = MOTIVATION_OPTIONS.filter((m) => sharedActivityTypesByMotivation[m.value])
  if (!pattern && motivations.length === 0 && !varietyType && !interestField) return null

  return (
    <View className="mt-10">
      <Text className="mb-4 text-2xl font-semibold text-gray-900">Why this matches you</Text>
      <View className="gap-3">
        {pattern || interestField ? (
          <View className="flex-row gap-3">
            {pattern ? (
              <ReasonBox
                testID="pattern-reason-box"
                icon={<PatternIcon color={PATTERN_COLORS[pattern.id]} size={32} />}
                label={pattern.name}
                backgroundColor={`${PATTERN_COLORS[pattern.id]}${PATTERN_BOX_TINT_ALPHA}`}
                labelColor={colors.gray[900]}
              />
            ) : null}
            {interestField ? (
              <ReasonBox
                testID="interest-reason-box"
                icon={<FieldIcon field={interestField} />}
                label={interestField}
                backgroundColor={colors.warm.bg}
                labelColor={colors.warm.accent}
              />
            ) : null}
          </View>
        ) : null}
        {motivations.map((m) => (
          <View key={m.value} className="rounded-2xl bg-gray-100 p-4">
            <Text className="text-base leading-relaxed text-gray-800">
              You chose <Text className="font-semibold text-gray-900">{m.label}</Text> as a motivation, and this
              activity is <Text className="font-semibold text-gray-900">{joinWithAnd(sharedActivityTypesByMotivation[m.value] ?? [])}</Text>.
            </Text>
          </View>
        ))}
        {varietyType ? (
          <View className="rounded-2xl bg-gray-100 p-4">
            <Text className="text-base leading-relaxed text-gray-800">
              Your best-matching <Text className="font-semibold text-gray-900">{varietyType}</Text> pick
              {interestField ? " in your interests" : ""}.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

function FieldIcon({ field }: { field: ActivityField }) {
  const Icon = getFieldIcon(field)
  return <Icon size={32} color={colors.warm.accent} strokeWidth={1.7} />
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}
