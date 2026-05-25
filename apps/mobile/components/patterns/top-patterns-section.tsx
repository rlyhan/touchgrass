import { useMemo, useState } from "react"
import { Modal, Pressable, Text, View } from "react-native"

import type {
  PatternType,
  PatternTypeId,
  UserPatternWeights,
} from "@touchgrass/types"
import { PATTERN_TYPES } from "@touchgrass/types/constants"

import { PatternRing } from "./pattern-ring"

const PATTERN_BY_ID: Record<string, PatternType> = Object.fromEntries(
  PATTERN_TYPES.map((p) => [p.id, p]),
)

type Props = {
  patternWeights: UserPatternWeights
}

function pickTopThree(weights: UserPatternWeights): PatternTypeId[] {
  return (Object.entries(weights) as [PatternTypeId, number][])
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return a[0].localeCompare(b[0])
    })
    .slice(0, 3)
    .map(([id]) => id)
}

export function TopPatternsSection({ patternWeights }: Props) {
  const topThree = useMemo(() => pickTopThree(patternWeights), [patternWeights])
  const [focusedId, setFocusedId] = useState<PatternTypeId | null>(null)
  const focused = focusedId !== null ? PATTERN_BY_ID[focusedId] : null

  return (
    <View className="mb-8">
      <Text className="text-xl font-semibold text-gray-900">
        Your highest matching personality patterns.
      </Text>
      <Text className="mt-1 text-sm text-gray-600">
        Tap to learn more about each pattern.
      </Text>
      <View className="mt-5 flex-row justify-around">
        {topThree.map((id) => {
          const pattern = PATTERN_BY_ID[id]
          if (!pattern) return null
          return (
            <Pressable
              key={id}
              onPress={() => setFocusedId(id)}
              accessibilityRole="button"
              accessibilityLabel={`Learn more about ${pattern.name}`}
              className="flex-1 items-center"
            >
              <PatternRing
                percent={patternWeights[id] * 100}
                label={pattern.name}
              />
            </Pressable>
          )
        })}
      </View>
      <Modal
        visible={focused !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFocusedId(null)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-6"
          onPress={() => setFocusedId(null)}
        >
          <View
            onStartShouldSetResponder={() => true}
            className="w-full max-w-md rounded-2xl bg-white p-6"
          >
            {focused && (
              <>
                <Text className="text-xl font-semibold text-gray-900">
                  {focused.name}
                </Text>
                <Text className="mt-3 text-sm leading-relaxed text-gray-700">
                  {focused.shortDescription}
                </Text>
                <Pressable
                  onPress={() => setFocusedId(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  className="mt-6 self-end rounded-full bg-gray-100 px-4 py-2"
                >
                  <Text className="text-sm font-medium text-gray-700">
                    Close
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}
