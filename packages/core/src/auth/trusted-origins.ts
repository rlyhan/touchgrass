export type TrustedOriginsOptions = {
  extraTrustedOrigins: string[]
  isProd: boolean
}

const DEV_TRUSTED_ORIGINS = [
  "http://localhost:8081",
  "http://localhost:19006",
  "http://localhost:19000",
  "exp://",
]

const APP_SCHEME = "touchgrass://"

export function parseExtraTrustedOrigins(
  raw: string | undefined,
): string[] {
  return raw?.split(",").map((s) => s.trim()).filter(Boolean) ?? []
}

export function resolveTrustedOrigins({
  extraTrustedOrigins,
  isProd,
}: TrustedOriginsOptions): string[] {
  if (isProd) {
    const hasHttpsOrigin = extraTrustedOrigins.some((o) =>
      o.startsWith("https://"),
    )
    if (!hasHttpsOrigin) {
      throw new Error(
        "BETTER_AUTH_TRUSTED_ORIGINS must include at least one https:// origin in production",
      )
    }
    return [APP_SCHEME, ...extraTrustedOrigins]
  }
  return [APP_SCHEME, ...DEV_TRUSTED_ORIGINS, ...extraTrustedOrigins]
}

// Browsers only ever send `http(s)://...` in the Origin header, so the cors
// middleware should only see those values. App-scheme entries (touchgrass://,
// exp://) are meaningful to better-auth's own trustedOrigins check but are
// noise — and a potential mis-config foothold — when passed to cors.
export function resolveCorsOrigins(origins: string[]): string[] {
  return origins.filter(
    (o) => o.startsWith("http://") || o.startsWith("https://"),
  )
}
