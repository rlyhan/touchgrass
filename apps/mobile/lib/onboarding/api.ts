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
