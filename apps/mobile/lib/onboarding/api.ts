import { UnauthenticatedError } from "@/lib/auth/errors"
import { authedFetch } from "@/lib/auth/fetch"
import { apiUrl } from "@/lib/config"

import type { OnboardingFormValues } from "./types"

function birthdateToIso(formValue: string): string {
  const match = formValue.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return formValue
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm}-${dd}`
}

export type CreateProfileResponse = {
  profile: { id: string }
}

// There's no dedicated profile lookup endpoint, so this probes the cheapest
// profile-backed one: /pattern-weights answers 404 when the signed-in user has
// no profile yet and 200 once onboarding has created one.
export async function fetchHasProfile(): Promise<boolean> {
  const response = await authedFetch(apiUrl("/pattern-weights"))

  if (response.status === 401) throw new UnauthenticatedError()
  if (response.status === 404) return false
  if (!response.ok) {
    throw new Error(`Failed to check profile (${response.status})`)
  }
  return true
}

export async function createProfile(
  values: OnboardingFormValues,
): Promise<CreateProfileResponse> {
  const response = await authedFetch(apiUrl("/profiles"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...values,
      birthdate: birthdateToIso(values.birthdate),
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(
      `Failed to create profile (${response.status}): ${body || "<empty body>"}`,
    )
  }

  return (await response.json()) as CreateProfileResponse
}
