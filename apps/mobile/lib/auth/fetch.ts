import { Platform } from "react-native"

import { authClient } from "./client"
import { clearStoredToken, getStoredToken } from "./token-store"

export async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  if (Platform.OS === "web") {
    const token = getStoredToken()
    const headers = new Headers(init.headers)
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    const response = await fetch(input, { ...init, headers })
    if (response.status === 401) {
      clearStoredToken()
    }
    return response
  }
  const cookie = authClient.getCookie()
  const headers = new Headers(init.headers)
  if (cookie) {
    headers.set("Cookie", cookie)
  }
  return fetch(input, { ...init, headers })
}
