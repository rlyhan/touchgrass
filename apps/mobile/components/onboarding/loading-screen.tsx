import { ActivityIndicator, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { PrimaryButton } from "@/components/ui/primary-button"

export type OnboardingLoadingStatus = "loading" | "error"

type Props = {
  status: OnboardingLoadingStatus
  onRetry: () => void
  errorMessage?: string
}

export function OnboardingLoadingView({ status, onRetry, errorMessage }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 items-center justify-center px-8">
        <GrassLogo />
        {status === "loading" ? (
          <>
            <ActivityIndicator
              size="large"
              color="#10b981"
              className="mt-10"
            />
            <Text className="mt-8 text-center text-xl font-semibold text-gray-900">
              Let&apos;s see what your next thing could be!
            </Text>
          </>
        ) : (
          <>
            <Text className="mt-10 text-center text-xl font-semibold text-gray-900">
              Something went wrong.
            </Text>
            <Text className="mt-2 text-center text-base text-gray-600">
              {errorMessage ?? "We couldn’t set up your profile. Please try again."}
            </Text>
            <View className="mt-8 w-full">
              <PrimaryButton label="Try again" onPress={onRetry} />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}
