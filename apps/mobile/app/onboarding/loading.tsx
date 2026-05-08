import { router, type Href } from "expo-router"
import { useCallback, useEffect, useState } from "react"

import {
  OnboardingLoadingView,
  type OnboardingLoadingStatus,
} from "@/components/onboarding/loading-screen"
import { useSession } from "@/lib/auth/client"
import { createProfile } from "@/lib/onboarding/api"
import { useOnboardingForm } from "@/lib/onboarding/context"

export default function OnboardingLoadingScreen() {
  const { getValues } = useOnboardingForm()
  const { data: session } = useSession()
  const [status, setStatus] = useState<OnboardingLoadingStatus>("loading")
  const [errorMessage, setErrorMessage] = useState<string | undefined>()

  const submit = useCallback(async () => {
    setStatus("loading")
    setErrorMessage(undefined)

    const values = getValues()

    // If core profile fields are empty the form context was lost (e.g. the OS
    // killed the app while on this screen and navigation state was restored
    // without the in-memory form). Redirect the user to re-enter their details
    // rather than firing a request we know will fail.
    if (!values.birthdate.trim() || !values.heightCm.trim() || !values.location.trim()) {
      router.replace("/onboarding/basic-details" as Href)
      return
    }

    // name is collected in step 1 alongside sign-up. If it was lost, recover it
    // from the auth session (which always has it after signUp.email completes).
    const name = values.name.trim() || session?.user?.name || ""
    if (!name) {
      router.replace("/onboarding/name" as Href)
      return
    }

    try {
      await createProfile({ ...values, name })
      router.replace("/recommendations")
    } catch (err) {
      console.error("createProfile failed", err)
      const isNetworkError = err instanceof TypeError
      setErrorMessage(
        isNetworkError
          ? "Check your connection and try again."
          : "Something went wrong on our end. Try again in a moment.",
      )
      setStatus("error")
    }
  }, [getValues, session])

  useEffect(() => {
    submit()
  }, [submit])

  return <OnboardingLoadingView status={status} onRetry={submit} errorMessage={errorMessage} />
}
