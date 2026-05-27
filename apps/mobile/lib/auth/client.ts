import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

import { API_BASE_URL } from "../config"
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "./token-store"

const isWeb = Platform.OS === "web"

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  fetchOptions: isWeb
    ? {
        onRequest: (ctx) => {
          const token = getStoredToken()
          if (token) {
            ctx.headers.set("Authorization", `Bearer ${token}`)
          }
          return ctx
        },
        onSuccess: (ctx) => {
          // The signed bearer token (value.signature) is exposed via the
          // `set-auth-token` response header by better-auth's bearer plugin.
          // Reading from the header (vs the body's `token` field) keeps the
          // raw session id out of response bodies that might be logged.
          const issued = ctx.response?.headers.get("set-auth-token")
          if (issued) {
            setStoredToken(issued)
            return
          }
          const url = ctx.request?.url?.toString() ?? ""
          if (url.includes("/sign-out")) {
            clearStoredToken()
          }
        },
        onError: (ctx) => {
          if (ctx.response?.status === 401) {
            clearStoredToken()
          }
        },
      }
    : undefined,
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
