import { Text, View } from "react-native"

import { PatternMatchAccordion } from "@/components/patterns/pattern-match-accordion"
import { usePatternWeights } from "@/lib/patterns/use-pattern-weights"
import type { Activity, MatchLabel, SharedActivityTypesByMotivation } from "@touchgrass/types"
import { MOTIVATION_OPTIONS, PATTERN_TYPES } from "@touchgrass/types/constants"
import { getDominantPatternId } from "@touchgrass/types/dominant-pattern"

// "Why this matches you" on the activity page: one row per reason behind the activity's match label.
// Activities from the recommendations screen without a label fall back to the ?pattern= link, which is
// only shown if it matches the viewer's own weights, so shared or edited links can't claim a match.

const PATTERN_BY_ID = Object.fromEntries(PATTERN_TYPES.map((p) => [p.id, p]))

type Props = {
  activity: Activity
  matchLabel?: MatchLabel
  linkedPatternId?: string
}

export function MatchReasons({ activity, matchLabel, linkedPatternId }: Props) {
  const sharedActivityTypesByMotivation =
    matchLabel && "sharedActivityTypesByMotivation" in matchLabel ? matchLabel.sharedActivityTypesByMotivation : {}

  if (matchLabel && "patternId" in matchLabel) {
    return <ReasonsSection patternId={matchLabel.patternId} sharedActivityTypesByMotivation={sharedActivityTypesByMotivation} />
  }
  if (linkedPatternId) {
    return (
      <LinkedPatternReasons
        activity={activity}
        linkedPatternId={linkedPatternId}
        sharedActivityTypesByMotivation={sharedActivityTypesByMotivation}
      />
    )
  }
  return <ReasonsSection sharedActivityTypesByMotivation={sharedActivityTypesByMotivation} />
}

function LinkedPatternReasons({
  activity,
  linkedPatternId,
  sharedActivityTypesByMotivation,
}: {
  activity: Activity
  linkedPatternId: string
  sharedActivityTypesByMotivation: SharedActivityTypesByMotivation
}) {
  const { weights } = usePatternWeights()
  const isViewersPattern = weights !== undefined && getDominantPatternId(weights, activity) === linkedPatternId
  return (
    <ReasonsSection
      patternId={isViewersPattern ? linkedPatternId : undefined}
      sharedActivityTypesByMotivation={sharedActivityTypesByMotivation}
    />
  )
}

function ReasonsSection({
  patternId,
  sharedActivityTypesByMotivation,
}: {
  patternId?: string
  sharedActivityTypesByMotivation: SharedActivityTypesByMotivation
}) {
  const pattern = patternId ? PATTERN_BY_ID[patternId] : undefined
  const motivations = MOTIVATION_OPTIONS.filter((m) => sharedActivityTypesByMotivation[m.value])
  if (!pattern && motivations.length === 0) return null

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
      </View>
    </View>
  )
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}
