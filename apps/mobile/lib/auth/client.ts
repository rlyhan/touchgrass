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
        credentials: "include",
        onRequest: (ctx) => {
          const token = getStoredToken()
          if (token) {
            ctx.headers.set("Authorization", `Bearer ${token}`)
          }
          return ctx
        },
        onSuccess: (ctx) => {
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

const {
  signIn: _signIn,
  signUp: _signUp,
  signOut,
  useSession,
  getSession,
} = authClient

// On web, the bearer token must be in localStorage before the caller's
// next request (e.g. refetch() in sign-in.tsx). Wrapping here is more
// reliable than the onSuccess hook, which may fire after the promise resolves.
export const signIn = isWeb
  ? {
      ..._signIn,
      email: async (...args: Parameters<typeof _signIn.email>) => {
        const result = await _signIn.email(...args)
        if (result.data?.token) setStoredToken(result.data.token)
        return result
      },
    }
  : _signIn

export const signUp = isWeb
  ? {
      ..._signUp,
      email: async (...args: Parameters<typeof _signUp.email>) => {
        const result = await _signUp.email(...args)
        if (result.data?.token) setStoredToken(result.data.token)
        return result
      },
    }
  : _signUp

export { signOut, useSession, getSession }
