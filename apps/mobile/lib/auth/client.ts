import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  // eslint-disable-next-line no-undef
  (__DEV__ ? "http://localhost:3000" : (() => { throw new Error("EXPO_PUBLIC_API_BASE_URL must be set in production builds") })())

const isWeb = Platform.OS === "web"

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: isWeb ? { credentials: "include" } : undefined,
  plugins: isWeb
    ? []
    : [
        expoClient({
          scheme: "touchgrass",
          storagePrefix: "touchgrass",
          storage: SecureStore,
        }),
      ],
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient
