const TOKEN_KEY = "touchgrass.session_token"

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // localStorage may be unavailable (e.g. private mode quota)
  }
}

export function clearStoredToken(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // localStorage may be unavailable
  }
}
