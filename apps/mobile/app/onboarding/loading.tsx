import { router } from "expo-router"
import { useCallback, useEffect, useState } from "react"

import {
  OnboardingLoadingView,
  type OnboardingLoadingStatus,
} from "@/components/onboarding/loading-screen"
import { createProfile } from "@/lib/onboarding/api"
import { useOnboardingForm } from "@/lib/onboarding/context"

export default function OnboardingLoadingScreen() {
  const { getValues } = useOnboardingForm()
  const [status, setStatus] = useState<OnboardingLoadingStatus>("loading")

  const submit = useCallback(async () => {
    setStatus("loading")
    try {
      await createProfile(getValues())
      router.replace("/recommendations")
    } catch (err) {
      console.error("createProfile failed", err)
      setStatus("error")
    }
  }, [getValues])

  useEffect(() => {
    submit()
  }, [submit])

  return <OnboardingLoadingView status={status} onRetry={submit} />
}
