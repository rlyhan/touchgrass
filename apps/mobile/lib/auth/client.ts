import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000"

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
