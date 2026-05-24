import { router, type Href } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { OnboardingProgress } from "@/components/onboarding/progress"
import { colors } from "@/lib/theme/colors"

type ScreenShellProps = {
  step: number
  totalSteps: number
  title: string
  subtitle?: string
  children: React.ReactNode
  footer: React.ReactNode
  contentStyle?: ViewStyle
  backHref?: Href
}

export function OnboardingScreenShell({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  footer,
  contentStyle,
  backHref,
}: ScreenShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="relative items-center justify-center px-5 pt-4">
          {step > 1 && backHref && (
            <TouchableOpacity
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace(backHref)
              }
              className="absolute left-5"
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={24} color={colors.gray[600]} />
            </TouchableOpacity>
          )}
          <GrassLogo />
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
