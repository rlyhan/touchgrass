// Starts a real createApp() server for route tests. Every dependency has a
// harmless default, so each test file only passes the mocks it asserts on.
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before } from "node:test"

import { type AppDeps, type AppOptions, createApp } from "../app.js"

const defaultDeps: AppDeps = {
  authHandler: (_req, res) => {
    res.sendStatus(404)
  },
  corsOrigins: [],
  getSessionUserId: async () => null,
  insertProfile: async () => {
    throw new Error("insertProfile is not mocked in this test file")
  },
  getProfileByAuthUserId: async () => null,
  updateProfileByAuthUserId: async () => null,
  loadActivities: async () => [],
  getActivityBySlug: async () => null,
}

export function setupTestApp(
  deps: Partial<AppDeps> = {},
  options: AppOptions = { disableRateLimits: true },
) {
  let server: Server
  const testApp = { baseUrl: "" }

  before(() => {
    server = createApp({ ...defaultDeps, ...deps }, options).listen(0)
    const { port } = server.address() as AddressInfo
    testApp.baseUrl = `http://127.0.0.1:${port}`
  })

  after(() => {
    server.close()
  })

  return testApp
}
