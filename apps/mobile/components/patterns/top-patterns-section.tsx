import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Pressable, Text, View } from "react-native"
import Animated, {
  Easing,
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
const PANEL_GAP = 16
const DETAIL_PADDING = 16

const TIMING_CONFIG = {
  duration: ANIMATION_DURATION,
  easing: Easing.out(Easing.cubic),
}

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

function PatternDetail({ pattern }: { pattern: PatternType }) {
  return (
    <>
      <Text className="text-base font-semibold text-gray-900">
        {pattern.name}
      </Text>
      <Text className="mt-2 text-sm leading-relaxed text-gray-700">
        {pattern.shortDescription}
      </Text>
    </>
  )
}

export function TopPatternsSection({ patternWeights }: Props) {
  const topThree = useMemo(() => pickTopThree(patternWeights), [patternWeights])
  const [selectedId, setSelectedId] = useState<PatternTypeId | null>(null)
  // Keep the last-shown pattern mounted so the collapse animation has
  // something to fade/shrink instead of the content vanishing instantly.
  const [displayedId, setDisplayedId] = useState<PatternTypeId | null>(null)
  const heightById = useRef<Partial<Record<PatternTypeId, number>>>({})
  const heightValue = useSharedValue(0)
  const opacityValue = useSharedValue(0)
  const gapValue = useSharedValue(0)
  const displayed = displayedId !== null ? PATTERN_BY_ID[displayedId] : null
  const needsMeasure =
    displayedId !== null && heightById.current[displayedId] === undefined

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

  // Open (cached path): when displayedId changes and the height is already
  // known, start the animation immediately without going through a state
  // update. Uncached patterns are handled in handleLayout instead.
  useEffect(() => {
    if (!displayedId) return
    const cached = heightById.current[displayedId]
    if (cached === undefined) return
    heightValue.value = withTiming(cached, TIMING_CONFIG)
    opacityValue.value = withTiming(1, TIMING_CONFIG)
    gapValue.value = withTiming(PANEL_GAP, TIMING_CONFIG)
  }, [displayedId, heightValue, opacityValue, gapValue])

  // Close: animate to zero when deselected.
  useEffect(() => {
    if (selectedId !== null) return
    heightValue.value = withTiming(0, TIMING_CONFIG)
    opacityValue.value = withTiming(0, TIMING_CONFIG)
    gapValue.value = withTiming(0, TIMING_CONFIG)
  }, [selectedId, heightValue, opacityValue, gapValue])

  const gapStyle = useAnimatedStyle(() => ({
    height: gapValue.value,
  }))

  const panelStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
    opacity: opacityValue.value,
  }))

  function handleLayout(height: number) {
    if (!displayedId || height === 0) return
    const prev = heightById.current[displayedId]
    if (prev === height) return
    heightById.current[displayedId] = height
    // Trigger animation directly — skips the setContentHeight → re-render →
    // effect chain that causes visible jank on Android.
    heightValue.value = withTiming(height, TIMING_CONFIG)
    opacityValue.value = withTiming(1, TIMING_CONFIG)
    gapValue.value = withTiming(PANEL_GAP, TIMING_CONFIG)
  }

  const handleSelect = useCallback((id: PatternTypeId) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

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

      <Animated.View style={gapStyle} />

      {needsMeasure && displayed ? (
        <View
          style={{
            position: "absolute",
            opacity: 0,
            left: 0,
            right: 0,
            pointerEvents: "none",
          }}
        >
          <View
            style={{ padding: DETAIL_PADDING }}
            onLayout={(e) => handleLayout(e.nativeEvent.layout.height)}
          >
            <PatternDetail pattern={displayed} />
          </View>
        </View>
      ) : null}

      <Animated.View
        style={[
          {
            overflow: "hidden",
            borderRadius: 16,
            backgroundColor: colors.gray[100],
          },
          panelStyle,
        ]}
      >
        <View testID="pattern-detail-panel" style={{ padding: DETAIL_PADDING }}>
          {displayed ? <PatternDetail pattern={displayed} /> : null}
        </View>
      </Animated.View>
    </View>
  )
}
