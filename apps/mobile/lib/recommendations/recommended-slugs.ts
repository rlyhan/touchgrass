import { useSyncExternalStore } from "react"

import type { MatchLabel } from "@touchgrass/types"

// Recommended slugs and match labels from the last fetchRecommendations call,
// read by browse to sort activities and label their cards.
let slugs: ReadonlySet<string> = new Set()
let matchLabels: Readonly<Record<string, MatchLabel>> = {}
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

function getMatchLabelsSnapshot() {
  return matchLabels
}

export function setRecommendedSlugs(next: string[]): void {
  slugs = new Set(next)
  notify()
}

export function setMatchLabels(next: Record<string, MatchLabel>): void {
  matchLabels = next
  notify()
}

export function clearRecommendedSlugs(): void {
  slugs = new Set()
  matchLabels = {}
  notify()
}

export function useRecommendedSlugs(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useMatchLabels(): Readonly<Record<string, MatchLabel>> {
  return useSyncExternalStore(subscribe, getMatchLabelsSnapshot, getMatchLabelsSnapshot)
}
