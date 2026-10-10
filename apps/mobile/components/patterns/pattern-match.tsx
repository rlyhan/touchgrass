import { View } from "react-native"

import { PatternMatchAccordion } from "@/components/patterns/pattern-match-accordion"
import { usePatternWeights } from "@/lib/patterns/use-pattern-weights"
import type { Activity } from "@touchgrass/types"
import { PATTERN_TYPES } from "@touchgrass/types/constants"
import { getDominantPatternId } from "@touchgrass/types/dominant-pattern"

const PATTERN_BY_ID = Object.fromEntries(PATTERN_TYPES.map((p) => [p.id, p]))

// The pattern arrives as a query param from the recommendations list. It is
// only shown if it matches the viewer's own weights, so shared or edited links
// can't claim a match for someone else.
export function PatternMatch({ activity, patternId }: { activity: Activity; patternId: string }) {
  const { weights } = usePatternWeights()
  if (!weights || getDominantPatternId(weights, activity) !== patternId) return null
  const pattern = PATTERN_BY_ID[patternId]
  if (!pattern) return null
  return (
    <View className="mt-5">
      <PatternMatchAccordion
        patternName={pattern.name}
        shortDescription={pattern.shortDescription}
      />
    </View>
  )
}
