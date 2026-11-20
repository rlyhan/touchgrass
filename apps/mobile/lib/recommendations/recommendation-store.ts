// A module-level store rather than React context, because non-React code (fetchRecommendations in api.ts)
// writes to it. useSyncExternalStore lets components re-render when it changes.
import { useSyncExternalStore } from "react"

import type { ActivityField, MatchLabel } from "@touchgrass/types"

// Why each recommended activity matched, keyed by slug; browse sorts and labels cards with it, the activity page explains matches.
let matchLabelsBySlug: Readonly<Record<string, MatchLabel>> = {}
// The user's interests from the last recommendations fetch; the activity page uses them to explain why an activity matched.
let lastFetchedInterests: readonly ActivityField[] = []
// Counts store wipes (logout, preferences save); stale in-flight fetches skip writing, and the recommendations screen refetches when it changes.
let clearCount = 0
// Callbacks React adds through subscribe, one per useMatchLabels, useInterests or useRecommendationsGeneration
// call in a mounted component; notify() runs them all.
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

function getMatchLabelsBySlugSnapshot() {
  return matchLabelsBySlug
}

function getLastFetchedInterestsSnapshot() {
  return lastFetchedInterests
}

function getClearCountSnapshot() {
  return clearCount
}

export function setMatchLabels(labelsBySlug: Record<string, MatchLabel>): void {
  matchLabelsBySlug = labelsBySlug
  notify()
}

export function setInterests(interests: ActivityField[]): void {
  lastFetchedInterests = interests
  notify()
}

// Bumped on clear (logout or a preferences save) so a fetch started before it can tell its response is stale.
export function getRecommendationsGeneration(): number {
  return clearCount
}

export function clearRecommendationStore(): void {
  clearCount += 1
  matchLabelsBySlug = {}
  lastFetchedInterests = []
  notify()
}

// React hooks for reading the store. Each subscribes the calling component via useSyncExternalStore and
// re-renders it only when the value it reads is replaced, so screens stay in sync with fetches and wipes.
export function useMatchLabels(): Readonly<Record<string, MatchLabel>> {
  return useSyncExternalStore(subscribe, getMatchLabelsBySlugSnapshot, getMatchLabelsBySlugSnapshot)
}

export function useInterests(): readonly ActivityField[] {
  return useSyncExternalStore(subscribe, getLastFetchedInterestsSnapshot, getLastFetchedInterestsSnapshot)
}

export function useRecommendationsGeneration(): number {
  return useSyncExternalStore(subscribe, getClearCountSnapshot, getClearCountSnapshot)
}
