import Constants from "expo-constants"

function resolveBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL
  }
  // eslint-disable-next-line no-undef
  if (__DEV__) {
    // On a physical device running Expo Go, `localhost` resolves to the device
    // itself rather than the dev machine. Derive the LAN IP from Expo's manifest
    // so that both the simulator (127.0.0.1) and Expo Go on real devices work.
    const debuggerHost = Constants.expoGoConfig?.debuggerHost
    if (debuggerHost) {
      const ip = debuggerHost.split(":")[0]
      return `http://${ip}:3000`
    }
    return "http://localhost:3000"
  }
  throw new Error("EXPO_PUBLIC_API_BASE_URL must be set in production builds")
}

export const API_BASE_URL = resolveBaseUrl()

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${normalized}`
}
