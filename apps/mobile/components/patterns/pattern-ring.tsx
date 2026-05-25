import { useEffect } from "react"
import { Text, View } from "react-native"
import Animated, {
  Easing,
  useAnimatedProps,
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

type Props = {
  percent: number
  label: string
  duration?: number
}

export function PatternRing({ percent, label, duration = 800 }: Props) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withTiming(percent / 100, {
      duration,
      easing: Easing.out(Easing.cubic),
    })
  }, [percent, duration, progress])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }))

  return (
    <View className="items-center">
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
            animatedProps={animatedProps}
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
        className="mt-2 text-center text-xs font-medium text-gray-700"
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  )
}
