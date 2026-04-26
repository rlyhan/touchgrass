import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { Text, View } from "react-native"

import {
  TimeIcon,
  getFieldIcon,
  getTypeIcon,
} from "@/lib/recommendation-icons"

interface RecommendationCardProps {
  title: string
  imageUrl: string
  type: string
  field: string
  estimatedTime?: string
}

export function RecommendationCard({
  title,
  imageUrl,
  type,
  field,
  estimatedTime,
}: RecommendationCardProps) {
  const TypeIcon = getTypeIcon(type)
  const FieldIcon = getFieldIcon(field)

  return (
    <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="relative h-40 w-full">
        <Image
          source={{ uri: imageUrl }}
          contentFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.7)"]}
          locations={[0, 0.5, 1]}
          style={{ position: "absolute", inset: 0 }}
        />
        <Text className="absolute bottom-4 left-4 right-4 text-xl font-semibold text-white">
          {title}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-x-6 gap-y-2 px-4 py-3">
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
