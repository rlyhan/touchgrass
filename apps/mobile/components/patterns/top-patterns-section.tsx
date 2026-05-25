import { useEffect, useMemo, useState } from "react"
import { Pressable, Text, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import type {
  PatternType,
  PatternTypeId,
  UserPatternWeights,
} from "@touchgrass/types"
import { PATTERN_TYPES } from "@touchgrass/types/constants"

import { colors } from "@/lib/theme/colors"

import { PatternRing } from "./pattern-ring"

const PATTERN_BY_ID: Record<string, PatternType> = Object.fromEntries(
  PATTERN_TYPES.map((p) => [p.id, p]),
)

const ANIMATION_DURATION = 220

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
  const [selectedId, setSelectedId] = useState<PatternTypeId | null>(null)
  // Keep the last-shown pattern mounted so the collapse animation has
  // something to fade/shrink instead of the content vanishing instantly.
  const [displayedId, setDisplayedId] = useState<PatternTypeId | null>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const heightValue = useSharedValue(0)
  const opacityValue = useSharedValue(0)
  const displayed = displayedId !== null ? PATTERN_BY_ID[displayedId] : null

  useEffect(() => {
    if (selectedId !== null) {
      setDisplayedId(selectedId)
      return
    }
    // Collapse: keep the previous content mounted for the duration of the
    // animation so it can fade out, then unmount it.
    const timeout = setTimeout(() => setDisplayedId(null), ANIMATION_DURATION)
    return () => clearTimeout(timeout)
  }, [selectedId])

  useEffect(() => {
    const isOpen = selectedId !== null
    heightValue.value = withTiming(isOpen ? contentHeight : 0, {
      duration: ANIMATION_DURATION,
    })
    opacityValue.value = withTiming(isOpen ? 1 : 0, {
      duration: ANIMATION_DURATION,
    })
  }, [selectedId, contentHeight, heightValue, opacityValue])

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
    opacity: opacityValue.value,
  }))

  function handleSelect(id: PatternTypeId) {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  return (
    <View className="mb-6">
      <Text className="text-xl font-semibold text-gray-900">
        Your highest matching personality patterns.
      </Text>
      <Text className="mt-1 text-sm text-gray-600">
        Tap to learn more about each pattern.
      </Text>
      <View className="mt-5 flex-row justify-center gap-8">
        {topThree.map((id) => {
          const pattern = PATTERN_BY_ID[id]
          if (!pattern) return null
          const isSelected = selectedId === id
          return (
            <Pressable
              key={id}
              onPress={() => handleSelect(id)}
              accessibilityRole="button"
              accessibilityLabel={
                isSelected
                  ? `Hide details for ${pattern.name}`
                  : `Show details for ${pattern.name}`
              }
            >
              <PatternRing
                percent={patternWeights[id] * 100}
                label={pattern.name}
                isSelected={isSelected}
                anySelected={selectedId !== null}
              />
            </Pressable>
          )
        })}
      </View>
      <Animated.View
        style={[
          {
            overflow: "hidden",
            borderRadius: 16,
            backgroundColor: colors.gray[100],
            marginTop: displayedId ? 16 : 0
          },
          animatedStyle,
        ]}
      >
        <View
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
          style={{ padding: 16 }}
        >
          {displayed ? (
            <>
              <Text className="text-base font-semibold text-gray-900">
                {displayed.name}
              </Text>
              <Text className="mt-2 text-sm leading-relaxed text-gray-700">
                {displayed.shortDescription}
              </Text>
            </>
          ) : null}
        </View>
      </Animated.View>
    </View>
  )
}
