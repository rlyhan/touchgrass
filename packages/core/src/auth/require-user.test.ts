import { strict as assert } from "node:assert"
import { mock, test } from "node:test"

import type { Request, Response } from "express"

import { requireUser } from "./require-user.js"

function fakeResponse() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(body: unknown) {
      res.body = body
      return res
    },
  }
  return res
}

const req = {} as Request

test("requireUser calls the handler with the session user id", async () => {
  const handler = mock.fn(async (_req: Request, _res: Response, _userId: string) => {})
  const res = fakeResponse()

  await requireUser(async () => "user_1", handler)(req, res as unknown as Response)

  assert.equal(handler.mock.callCount(), 1)
  assert.equal(handler.mock.calls[0]?.arguments[2], "user_1")
})

test("requireUser responds 401 and skips the handler without a session", async () => {
  const handler = mock.fn(async (_req: Request, _res: Response, _userId: string) => {})
  const res = fakeResponse()

  await requireUser(async () => null, handler)(req, res as unknown as Response)

  assert.equal(res.statusCode, 401)
  assert.deepEqual(res.body, { error: "Not authenticated" })
  assert.equal(handler.mock.callCount(), 0)
})

test("requireUser rejects when the session lookup throws", async () => {
  const handler = mock.fn(async (_req: Request, _res: Response, _userId: string) => {})
  const lookup = async () => {
    throw new Error("session lookup failed")
  }

  await assert.rejects(
    requireUser(lookup, handler)(req, fakeResponse() as unknown as Response),
    /session lookup failed/,
  )
  assert.equal(handler.mock.callCount(), 0)
})
