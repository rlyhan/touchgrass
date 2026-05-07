import { Platform } from "react-native"

import { authClient } from "./client"

export function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  if (Platform.OS === "web") {
    return fetch(input, { ...init, credentials: "include" })
  }
  const cookie = authClient.getCookie()
  const headers = new Headers(init.headers)
  if (cookie) {
    headers.set("Cookie", cookie)
  }
  return fetch(input, { ...init, headers })
}
