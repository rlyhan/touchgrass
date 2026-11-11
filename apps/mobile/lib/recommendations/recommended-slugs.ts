import { useSyncExternalStore } from "react"

import type { ActivityField, MatchLabel, PatternTypeId } from "@touchgrass/types"

// Recommended slugs, match labels, the recommendations screen's patterns and the user's interests from the last
// fetchRecommendations call, read by browse to sort and label cards and by the activity page to explain them.
let slugs: ReadonlySet<string> = new Set()
let matchLabels: Readonly<Record<string, MatchLabel>> = {}
let dominantPatternIds: Readonly<Record<string, PatternTypeId>> = {}
let interests: readonly ActivityField[] = []
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

function getDominantPatternIdsSnapshot() {
  return dominantPatternIds
}

function getInterestsSnapshot() {
  return interests
}

export function setRecommendedSlugs(next: string[]): void {
  slugs = new Set(next)
  notify()
}

export function setMatchLabels(next: Record<string, MatchLabel>): void {
  matchLabels = next
  notify()
}

export function setDominantPatternIds(next: Record<string, PatternTypeId>): void {
  dominantPatternIds = next
  notify()
}

export function setInterests(next: ActivityField[]): void {
  interests = next
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
  dominantPatternIds = {}
  interests = []
  notify()
}

export function useRecommendedSlugs(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useMatchLabels(): Readonly<Record<string, MatchLabel>> {
  return useSyncExternalStore(subscribe, getMatchLabelsSnapshot, getMatchLabelsSnapshot)
}

export function useDominantPatternIds(): Readonly<Record<string, PatternTypeId>> {
  return useSyncExternalStore(subscribe, getDominantPatternIdsSnapshot, getDominantPatternIdsSnapshot)
}

export function useInterests(): readonly ActivityField[] {
  return useSyncExternalStore(subscribe, getInterestsSnapshot, getInterestsSnapshot)
}
