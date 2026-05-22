import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

import { API_BASE_URL } from "../config"

const isWeb = Platform.OS === "web"

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
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
