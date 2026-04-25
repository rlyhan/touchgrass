import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import { Palette, UserCircle } from "lucide-react-native"
import { Text, View } from "react-native"

interface RecommendationCardProps {
  title: string
  imageUrl: string
  type: string
  field: string
}

export function RecommendationCard({
  title,
  imageUrl,
  type,
  field,
}: RecommendationCardProps) {
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

      <View className="flex-row gap-6 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Palette size={16} color="#4b5563" />
          <Text className="text-sm text-gray-600">{type}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <UserCircle size={16} color="#4b5563" />
          <Text className="text-sm text-gray-600">{field}</Text>
        </View>
      </View>
    </View>
  )
}
