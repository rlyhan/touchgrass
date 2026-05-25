// Single source of truth for colour values used in JS props
// (ActivityIndicator color, lucide icon color, SVG fills, inline style values).
// For className styling, use the equivalent NativeWind utility.

export const colors = {
  // Warm accent palette — Tip component + loading spinner
  warm: {
    bg: "#FFF3E0",      // Tip background — pale orange
    spinner: "#E0AE85", // Loading spinner — mid-tone warm tan
    accent: "#C2692A",  // Tip lightbulb icon — warm brown
  },

  // Tailwind-aligned values reused as raw hex in JS props
  emerald: {
    100: "#D1FAE5",
    300: "#6EE7B7",
    500: "#10B981",
    600: "#059669",
  },
  gray: {
    100: "#F3F4F6",
    200: "#E5E7EB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    900: "#111827",
  },
  red: {
    600: "#DC2626",
  },

  white: "#FFFFFF",
  black: "#000000",
} as const
