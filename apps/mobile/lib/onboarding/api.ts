import type { OnboardingFormValues } from "./types"

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000"

function birthdateToIso(formValue: string): string {
  const match = formValue.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return formValue
  const [, dd, mm, yyyy] = match
  return `${yyyy}-${mm}-${dd}`
}

export async function createUser(values: OnboardingFormValues): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...values,
      birthdate: birthdateToIso(values.birthdate),
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create user (${response.status})`)
  }
}
