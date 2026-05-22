import { Link, router, type Href } from "expo-router"
import { useState } from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { GrassLogo } from "@/components/icons/grass-logo"
import { PrimaryButton } from "@/components/ui/primary-button"
import { TextField } from "@/components/ui/text-field"
import { signIn, useSession } from "@/lib/auth/client"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignInScreen() {
  const { refetch } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedEmail = email.trim()
  const canContinue =
    EMAIL_REGEX.test(trimmedEmail) && password.length > 0 && !submitting

  const handleSubmit = async () => {
    if (!canContinue) return
    setSubmitting(true)
    setError(null)
    try {
      const { error: signInError } = await signIn.email({
        email: trimmedEmail,
        password,
      })
      if (signInError) {
        setError(signInError.message ?? "Could not sign in")
        return
      }
      await refetch()
      router.replace("/recommendations" as Href)
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="items-center px-5 pt-4">
          <GrassLogo />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 40,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </Text>
          <Text className="mt-2 text-base text-gray-500">
            Sign in to pick up where you left off.
          </Text>

          <View className="mt-8 gap-5">
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoFocus
              returnKeyType="next"
            />

            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {error ? (
              <Text className="text-sm text-red-600">{error}</Text>
            ) : null}
          </View>

          <View className="mt-8 flex-row justify-center">
            <Link href={"/onboarding/name" as Href} className="text-sm" accessibilityRole="link" accessibilityLabel="New here? Create an account">
              <Text className="text-gray-500">New here? </Text>
              <Text className="font-semibold text-emerald-600">
                Create an account
              </Text>
            </Link>
          </View>
        </ScrollView>

        <View className="border-t border-gray-100 px-5 pb-4 pt-4">
          <PrimaryButton
            label={submitting ? "Signing in..." : "Sign in"}
            disabled={!canContinue}
            onPress={handleSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
