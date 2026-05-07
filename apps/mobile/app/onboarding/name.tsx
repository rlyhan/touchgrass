import { Link, router, type Href } from "expo-router"
import { useState } from "react"
import { Controller, useWatch } from "react-hook-form"
import { Text, View } from "react-native"

import { OnboardingScreenShell } from "@/components/onboarding/screen-shell"
import { PrimaryButton } from "@/components/ui/primary-button"
import { TextField } from "@/components/ui/text-field"
import { signUp } from "@/lib/auth/client"
import { useOnboardingForm } from "@/lib/onboarding/context"

const NEXT: Href = "/onboarding/basic-details" as Href
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export default function NameScreen() {
  const { control } = useOnboardingForm()
  const [name, email, password, confirmPassword] = useWatch({
    control,
    name: ["name", "email", "password", "confirmPassword"],
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedName = name.trim()
  const trimmedEmail = email.trim()
  const isEmailValid = EMAIL_REGEX.test(trimmedEmail)
  const isPasswordValid = password.length >= MIN_PASSWORD_LENGTH
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword
  const canContinue =
    trimmedName.length > 0 &&
    isEmailValid &&
    isPasswordValid &&
    passwordsMatch &&
    !submitting

  const handleSubmit = async () => {
    if (!canContinue) return
    setSubmitting(true)
    setError(null)
    try {
      const { error: signUpError } = await signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
      })
      if (signUpError) {
        setError(signUpError.message ?? "Could not create account")
        return
      }
      router.push(NEXT)
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <OnboardingScreenShell
      step={1}
      totalSteps={5}
      title="Create your account"
      subtitle="We'll use this to save your progress so you don't have to start over."
      footer={
        <PrimaryButton
          label={submitting ? "Creating account..." : "Continue"}
          disabled={!canContinue}
          onPress={handleSubmit}
        />
      }
    >
      <View className="gap-5">
        <Controller
          control={control}
          name="name"
          rules={{ required: true, validate: (v) => v.trim().length > 0 }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label="Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Your name"
              autoCapitalize="words"
              autoFocus
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          rules={{
            required: true,
            validate: (v) => EMAIL_REGEX.test(v.trim()),
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: true,
            minLength: MIN_PASSWORD_LENGTH,
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="At least 8 characters"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              returnKeyType="next"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: true,
            validate: (v) => v === password,
          }}
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label="Confirm password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Re-enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          )}
        />

        {confirmPassword.length > 0 && !passwordsMatch ? (
          <Text className="text-sm text-red-600">Passwords don&apos;t match.</Text>
        ) : null}

        {error ? <Text className="text-sm text-red-600">{error}</Text> : null}

        <View className="mt-2 flex-row justify-center">
          <Link href={"/sign-in" as Href}>
            <Text className="text-gray-500">Already have an account? </Text>
            <Text className="font-semibold text-emerald-600">Sign in</Text>
          </Link>
        </View>
      </View>
    </OnboardingScreenShell>
  )
}
