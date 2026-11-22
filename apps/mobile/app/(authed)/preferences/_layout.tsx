import { Redirect, router, Stack, type Href } from "expo-router"
import { ActivityIndicator, Text, View } from "react-native"

import { PrimaryButton } from "@/components/ui/primary-button"
import { UnauthenticatedError } from "@/lib/auth/errors"
import { fetchProfilePreferences } from "@/lib/onboarding/api"
import { OnboardingProvider } from "@/lib/onboarding/context"
import { ONBOARDING_DEFAULT_VALUES } from "@/lib/onboarding/options"
import { ONBOARDING_ROUTES } from "@/lib/onboarding/routes"
import { colors } from "@/lib/theme/colors"
import { useAsyncData } from "@/lib/use-async-data"

async function loadPreferences() {
  try {
    return await fetchProfilePreferences()
  } catch (err) {
    if (err instanceof UnauthenticatedError) router.replace("/sign-in" as Href)
    throw err
  }
}

export default function PreferencesLayout() {
  const { data: preferences, status, reload } = useAsyncData(loadPreferences)

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color={colors.emerald[500]} />
      </View>
    )
  }

  if (status === "error") {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-xl font-semibold text-gray-900">
          Couldn&apos;t load your preferences.
        </Text>
        <View className="mt-8 w-full">
          <PrimaryButton label="Try again" onPress={reload} />
        </View>
      </View>
    )
  }

  if (!preferences) {
    return <Redirect href={ONBOARDING_ROUTES.basicDetails as Href} />
  }

  return (
    <OnboardingProvider defaultValues={{ ...ONBOARDING_DEFAULT_VALUES, ...preferences }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "white" },
        }}
      />
    </OnboardingProvider>
  )
}
