import { Text, View } from "react-native"

import { PatternMatchAccordion } from "@/components/patterns/pattern-match-accordion"
import type { ActivityField, ActivityType, PatternTypeId, SharedActivityTypesByMotivation } from "@touchgrass/types"
import { MOTIVATION_OPTIONS, PATTERN_TYPES } from "@touchgrass/types/constants"

// "Why this matches you" on the activity page: a row for the matched pattern, one per shared motivation, the activity's
// type when the recommendations screen picked it for variety, then its field when the user picked it as an interest.

const PATTERN_BY_ID = Object.fromEntries(PATTERN_TYPES.map((p) => [p.id, p]))

type Props = {
  patternId?: PatternTypeId
  sharedActivityTypesByMotivation?: SharedActivityTypesByMotivation
  varietyType?: ActivityType
  interestField?: ActivityField
}

export function MatchReasons({ patternId, sharedActivityTypesByMotivation = {}, varietyType, interestField }: Props) {
  const pattern = patternId ? PATTERN_BY_ID[patternId] : undefined
  const motivations = MOTIVATION_OPTIONS.filter((m) => sharedActivityTypesByMotivation[m.value])
  if (!pattern && motivations.length === 0 && !varietyType && !interestField) return null

  return (
    <View className="mt-10">
      <Text className="mb-4 text-2xl font-semibold text-gray-900">Why this matches you</Text>
      <View className="gap-3">
        {pattern ? (
          <PatternMatchAccordion patternName={pattern.name} shortDescription={pattern.shortDescription} />
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
        {interestField ? (
          <View className="rounded-2xl bg-gray-100 p-4">
            <Text className="text-base leading-relaxed text-gray-800">
              You picked <Text className="font-semibold text-gray-900">{interestField}</Text> as one of your interests.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}
