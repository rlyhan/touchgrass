import { useEffect } from "react"
import { Text, View } from "react-native"
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import Svg, { Circle } from "react-native-svg"

import { colors } from "@/lib/theme/colors"

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const SIZE = 88
const STROKE_WIDTH = 8
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const FADE_DURATION = 250
const DIMMED_OPACITY = 0.35

type Props = {
  percent: number
  label: string
  duration?: number
  isSelected?: boolean
  anySelected?: boolean
}

export function PatternRing({
  percent,
  label,
  duration = 800,
  isSelected = false,
  anySelected = false,
}: Props) {
  const progress = useSharedValue(0)
  const selection = useSharedValue(0)
  const containerOpacity = useSharedValue(1)

  useEffect(() => {
    progress.value = withTiming(percent / 100, {
      duration,
      easing: Easing.out(Easing.cubic),
    })
  }, [percent, duration, progress])

  useEffect(() => {
    selection.value = withTiming(isSelected ? 1 : 0, {
      duration: FADE_DURATION,
      easing: Easing.out(Easing.cubic),
    })
    const targetOpacity = anySelected && !isSelected ? DIMMED_OPACITY : 1
    containerOpacity.value = withTiming(targetOpacity, {
      duration: FADE_DURATION,
      easing: Easing.out(Easing.cubic),
    })
  }, [isSelected, anySelected, selection, containerOpacity])

  // Cross-fade two stacked circles (normal + pale) by opacity. Animating SVG
  // stroke colour via useAnimatedProps is unreliable; opacity is rock-solid.
  const animatedNormalCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
    opacity: 1 - selection.value,
  }))

  const animatedPaleCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
    opacity: selection.value,
  }))

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }))

  return (
    <Animated.View
      style={[containerStyle, { width: SIZE, alignItems: "center" }]}
    >
      <View style={{ width: SIZE, height: SIZE }}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.gray[200]}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.emerald[500]}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedNormalCircleProps}
            originX={SIZE / 2}
            originY={SIZE / 2}
            rotation={-90}
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors.emerald[300]}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedPaleCircleProps}
            originX={SIZE / 2}
            originY={SIZE / 2}
            rotation={-90}
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-base font-semibold text-gray-900">
            {Math.round(percent)}%
          </Text>
        </View>
      </View>
      <Text
        style={{ width: SIZE }}
        className="mt-2 text-center text-xs font-medium text-gray-700"
        numberOfLines={2}
      >
        {label}
      </Text>
    </Animated.View>
  )
}
