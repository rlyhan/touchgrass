import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { Pressable, Text } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import "react-native-reanimated"

import "../global.css"

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", padding: 24, paddingTop: 60 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold", color: "#dc2626", marginBottom: 8 }}>
        Something went wrong
      </Text>
      <Text style={{ fontSize: 13, color: "#111", marginBottom: 8 }}>
        {error.message}
      </Text>
      <Text style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>
        {error.stack}
      </Text>
      <Pressable
        onPress={retry}
        style={{ marginTop: 24, backgroundColor: "#10b981", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, alignSelf: "flex-start" }}
        accessibilityRole="button"
        accessibilityLabel="Try again"
      >
        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Try again</Text>
      </Pressable>
    </SafeAreaView>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  )
}
