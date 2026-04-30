import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
  type ViewStyle,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { OnboardingProgress } from "@/components/onboarding/progress"

type ScreenShellProps = {
  step: number
  totalSteps: number
  title: string
  subtitle?: string
  children: React.ReactNode
  footer: React.ReactNode
  contentStyle?: ViewStyle
}

export function OnboardingScreenShell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  footer,
  contentStyle,
}: ScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="items-center px-5 pt-4">
          <GrassLogo size={32} color="#10b981" />
        </View>
        <View className="px-5 pt-4">
          <OnboardingProgress step={step} totalSteps={totalSteps} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={[
            { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },
            contentStyle,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-2 text-base text-gray-500">{subtitle}</Text>
          ) : null}

          <View className="mt-8">{children}</View>
        </ScrollView>

        <View className="border-t border-gray-100 px-5 pb-4 pt-4">
          {footer}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
