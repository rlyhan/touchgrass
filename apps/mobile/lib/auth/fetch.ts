import { Platform } from "react-native"

import { authClient } from "./client"
import { getStoredToken } from "./token-store"

export function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  if (Platform.OS === "web") {
    const token = getStoredToken()
    const headers = new Headers(init.headers)
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    return fetch(input, { ...init, headers })
  }
  const cookie = authClient.getCookie()
  const headers = new Headers(init.headers)
  if (cookie) {
    headers.set("Cookie", cookie)
  }
  return fetch(input, { ...init, headers })
}
