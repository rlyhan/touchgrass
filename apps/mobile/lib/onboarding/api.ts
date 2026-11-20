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

export async function fetchHasProfile(): Promise<boolean> {
  const response = await authedFetch(apiUrl("/profile"))

  if (response.status === 401) throw new UnauthenticatedError()
  if (response.status === 404) return false
  if (!response.ok) {
    throw new Error(`Failed to check profile (${response.status})`)
  }
  return true
}

export type ProfilePreferences = Pick<
  OnboardingFormValues,
  "interests" | "personality" | "motivations"
>

export async function fetchProfilePreferences(): Promise<ProfilePreferences | null> {
  const response = await authedFetch(apiUrl("/profile"))

  if (response.status === 401) throw new UnauthenticatedError()
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`Failed to load profile (${response.status})`)
  }
  const { profile } = (await response.json()) as { profile: ProfilePreferences }
  return {
    interests: profile.interests,
    personality: profile.personality,
    motivations: profile.motivations,
  }
}

export async function updatePreferences(preferences: ProfilePreferences): Promise<void> {
  const response = await authedFetch(apiUrl("/profile"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preferences),
  })

  if (response.status === 401) throw new UnauthenticatedError()
  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(
      `Failed to update preferences (${response.status}): ${body || "<empty body>"}`,
    )
  }
}

export async function createProfile(
  values: OnboardingFormValues,
): Promise<CreateProfileResponse> {
  const response = await authedFetch(apiUrl("/profile"), {
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
