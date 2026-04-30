import { ScrollView, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { RecommendationCard } from "@/components/recommendations/recommendation-card"

const recommendations = [
  {
    id: "rec_001",
    title: "Build a Guitar Pedalboard",
    imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
    type: "Constructive",
    field: "Music",
    estimated_time: "A weekend"
  },
  {
    id: "rec_002",
    title: "Join a Beginner Boxing Class",
    imageUrl: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80",
    type: "Active",
    field: "Martial Arts",
    estimated_time: "1 hour"
  },
  {
    id: "rec_003",
    title: "Write a Short Horror Screenplay",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    type: "Artistic",
    field: "Literature",
    estimated_time: "A few hours"
  },
]

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
          {recommendations.map((rec) => (
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
