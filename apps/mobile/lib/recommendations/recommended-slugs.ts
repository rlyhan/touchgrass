import { useSyncExternalStore } from "react"

// Slugs in the user's top 15% of recommendations, filled by fetchRecommendations
// and read by browse to label matching activities.
let slugs: ReadonlySet<string> = new Set()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return slugs
}

export function setRecommendedSlugs(next: string[]): void {
  slugs = new Set(next)
  notify()
}

export function clearRecommendedSlugs(): void {
  slugs = new Set()
  notify()
}

export function useRecommendedSlugs(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
