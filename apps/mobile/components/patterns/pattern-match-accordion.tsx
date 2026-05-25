import { ChevronDown } from "lucide-react-native"
import { useEffect, useState } from "react"
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import { colors } from "@/lib/theme/colors"

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

type Props = {
  patternName: string
  shortDescription: string
}

export function PatternMatchAccordion({ patternName, shortDescription }: Props) {
  const [expanded, setExpanded] = useState(false)
  const chevron = useSharedValue(0)

  useEffect(() => {
    chevron.value = withTiming(expanded ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    })
  }, [expanded, chevron])

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevron.value * 180}deg` }],
  }))

  function handleToggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded((prev) => !prev)
  }

  return (
    <Pressable
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityLabel={
        expanded ? "Collapse pattern details" : "Expand pattern details"
      }
      className="rounded-2xl bg-gray-100 p-4"
    >
      <View className="flex-row items-start">
        <Text className="flex-1 text-base leading-relaxed text-gray-800">
          You were matched because you scored highly as a{" "}
          <Text className="font-semibold text-gray-900">{patternName}</Text>.
        </Text>
        <Animated.View style={chevronStyle} className="ml-3 mt-1">
          <ChevronDown size={18} color={colors.gray[600]} />
        </Animated.View>
      </View>
      <Text className="mt-2 text-sm font-medium text-gray-600">
        {expanded ? "See less" : "See more"}
      </Text>
      {expanded ? (
        <Text className="mt-3 text-sm leading-relaxed text-gray-700">
          {shortDescription}
        </Text>
      ) : null}
    </Pressable>
  )
}
