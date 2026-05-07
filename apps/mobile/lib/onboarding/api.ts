import { authedFetch } from "@/lib/auth/fetch"

import type { OnboardingFormValues } from "./types"

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000"

function birthdateToIso(formValue: string): string {
  const match = formValue.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return formValue
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm}-${dd}`
}

export type CreateProfileResponse = {
  profile: { id: string }
}

export async function createProfile(
  values: OnboardingFormValues,
): Promise<CreateProfileResponse> {
  const response = await authedFetch(`${API_BASE_URL}/profiles`, {
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
