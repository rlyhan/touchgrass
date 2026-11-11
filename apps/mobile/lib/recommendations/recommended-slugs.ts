import { useSyncExternalStore } from "react"

import type { MatchLabel, PatternTypeId } from "@touchgrass/types"

// Recommended slugs, match labels and the recommendations screen's patterns from the last
// fetchRecommendations call, read by browse to sort and label cards and by the activity page to explain them.
let slugs: ReadonlySet<string> = new Set()
let matchLabels: Readonly<Record<string, MatchLabel>> = {}
let dashboardPatternIds: Readonly<Record<string, PatternTypeId>> = {}
let generation = 0
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

function getDashboardPatternIdsSnapshot() {
  return dashboardPatternIds
}

export function setRecommendedSlugs(next: string[]): void {
  slugs = new Set(next)
  notify()
}

export function setMatchLabels(next: Record<string, MatchLabel>): void {
  matchLabels = next
  notify()
}

export function setDashboardPatternIds(next: Record<string, PatternTypeId>): void {
  dashboardPatternIds = next
  notify()
}

// Bumped on clear (logout) so a fetch started before it can tell its response is stale.
export function getRecommendationsGeneration(): number {
  return generation
}

export function clearRecommendedSlugs(): void {
  generation += 1
  slugs = new Set()
  matchLabels = {}
  dashboardPatternIds = {}
  notify()
}

export function useRecommendedSlugs(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useMatchLabels(): Readonly<Record<string, MatchLabel>> {
  return useSyncExternalStore(subscribe, getMatchLabelsSnapshot, getMatchLabelsSnapshot)
}

export function useDashboardPatternIds(): Readonly<Record<string, PatternTypeId>> {
  return useSyncExternalStore(subscribe, getDashboardPatternIdsSnapshot, getDashboardPatternIdsSnapshot)
}
