import { Platform } from "react-native"

// eslint-disable-next-line no-undef
const isWebProdRuntime =
  // eslint-disable-next-line no-undef
  Platform.OS === "web" && !__DEV__ && typeof window !== "undefined"

function resolveBaseUrl(): string {
  if (isWebProdRuntime) {
    return window.location.origin
  }
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL
  }
  // eslint-disable-next-line no-undef
  if (__DEV__) return "http://localhost:3000"
  throw new Error("EXPO_PUBLIC_API_BASE_URL must be set in production builds")
}

export const API_BASE_URL = resolveBaseUrl()

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  // eslint-disable-next-line no-undef
  if (Platform.OS === "web" && !__DEV__) {
    return `${API_BASE_URL}/_api${normalized}`
  }
  return `${API_BASE_URL}${normalized}`
}
