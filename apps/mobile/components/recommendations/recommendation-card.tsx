import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { Text, View } from "react-native"

import {
  TimeIcon,
  getActivityTypeIcon,
  getFieldIcon,
} from "@/lib/icons"

interface RecommendationCardProps {
  title: string
  imageUrl: string
  type: string
  field: string
  estimatedTime?: string
  size?: "default" | "large"
}

export function RecommendationCard({
  title,
  imageUrl,
  type,
  field,
  estimatedTime,
  size = "default",
}: RecommendationCardProps) {
  const TypeIcon = getActivityTypeIcon(type)
  const FieldIcon = getFieldIcon(field)
  const [imageError, setImageError] = useState(false)
  const isLarge = size === "large"

  return (
    <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <View
        className="relative w-full"
        style={isLarge ? { aspectRatio: 4 / 3 } : { height: 160 }}
      >
        {imageError ? (
          <View style={{ width: "100%", height: "100%", backgroundColor: "#d1fae5" }} />
        ) : (
          <Image
            source={{ uri: imageUrl }}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            onError={() => setImageError(true)}
          />
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.7)"]}
          locations={[0, 0.5, 1]}
          style={{ position: "absolute", inset: 0 }}
        />
        {isLarge ? (
          <View className="absolute bottom-0 left-0 right-0 p-5">
            <Text className="text-2xl font-bold leading-tight text-white">
              {title}
            </Text>
          </View>
        ) : (
          <Text className="absolute bottom-4 left-4 right-4 text-xl font-semibold text-white">
            {title}
          </Text>
        )}
      </View>

      <View className="flex-row flex-wrap gap-3 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <TypeIcon size={16} color="#4b5563" />
          <Text className="text-sm text-gray-600">{type}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <FieldIcon size={16} color="#4b5563" />
          <Text className="text-sm text-gray-600">{field}</Text>
        </View>
        {estimatedTime ? (
          <View className="flex-row items-center gap-2">
            <TimeIcon size={16} color="#4b5563" />
            <Text className="text-sm text-gray-600">{estimatedTime}</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}
