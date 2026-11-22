// Starts a real createApp() server for route tests. Any dependency not passed in
// falls back to the defaults in mocks.ts.
import type { Server } from "node:http"
import type { AddressInfo } from "node:net"
import { after, before } from "node:test"

import { type AppDeps, type AppOptions, createApp } from "../app.js"
import { defaultDataDeps } from "./mocks.js"

const defaultDeps: AppDeps = {
  authHandler: (_req, res) => {
    res.sendStatus(404)
  },
  corsOrigins: [],
  ...defaultDataDeps,
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
