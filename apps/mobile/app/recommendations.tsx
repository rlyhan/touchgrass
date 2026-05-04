import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { RecommendationCard } from "@/components/recommendations/recommendation-card"
import { RECOMMENDATIONS } from "@/lib/recommendations"

export default function RecommendationsPage() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView contentContainerClassName="px-5 py-8">
        <View className="items-center">
          <GrassLogo size={48} color="#10b981" />
        </View>

        <Text className="mt-8 text-3xl font-bold tracking-tight text-gray-900">
          You might be great at...
        </Text>

        <View className="mt-6 flex-col gap-4">
          {RECOMMENDATIONS.slice(0, 2).map((rec) => (
            <RecommendationCard
              key={rec.id}
              title={rec.title}
              imageUrl={rec.imageUrl}
              type={rec.type}
              field={rec.field}
              estimatedTime={rec.estimated_time}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
