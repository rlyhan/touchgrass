import { router, type Href } from "expo-router"
import { useCallback, useEffect, useState } from "react"

import {
  OnboardingLoadingView,
  type OnboardingLoadingStatus,
} from "@/components/onboarding/loading-screen"
import { createUser } from "@/lib/onboarding/api"
import { useOnboardingForm } from "@/lib/onboarding/context"

export default function OnboardingLoadingScreen() {
  const { getValues } = useOnboardingForm()
  const [status, setStatus] = useState<OnboardingLoadingStatus>("loading")

  const submit = useCallback(async () => {
    setStatus("loading")
    try {
      await createUser(getValues())
      router.replace("/recommendations" as Href)
    } catch {
      setStatus("error")
    }
  }, [getValues])

  useEffect(() => {
    submit()
  }, [submit])

  return <OnboardingLoadingView status={status} onRetry={submit} />
}
