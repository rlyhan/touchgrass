// Default data dependencies for route tests, and createMocks(), which turns each
// one into a mock.fn that resets to its default before every test.
import { beforeEach, type Mock, mock } from "node:test"

import type { AppDeps, AuthDeps } from "../app.js"
import { AUTH_USER_ID } from "./profile.js"

type DataDeps = Omit<AppDeps, keyof AuthDeps>
export type MockDeps = { [K in keyof DataDeps]: Mock<DataDeps[K]> }

export const defaultDataDeps: DataDeps = {
  getSessionUserId: async () => AUTH_USER_ID,
  insertProfile: async () => {
    throw new Error("insertProfile has no default; pass one to createMocks()")
  },
  getProfileByAuthUserId: async () => null,
  updateProfileByAuthUserId: async () => null,
  loadActivities: async () => [],
  getActivityBySlug: async () => null,
}

function resettableMock<F extends (...args: never[]) => unknown>(impl: F) {
  const fn = mock.fn(impl)
  beforeEach(() => {
    fn.mock.resetCalls()
    fn.mock.mockImplementation(impl)
  })
  return fn
}

export function createMocks(overrides: Partial<DataDeps> = {}): MockDeps {
  const impls = { ...defaultDataDeps, ...overrides }
  return Object.fromEntries(
    Object.entries(impls).map(([name, impl]) => [name, resettableMock(impl)]),
  ) as MockDeps
}
