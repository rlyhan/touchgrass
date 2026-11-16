import type { Request, Response } from "express"

export type SessionDeps = {
  getSessionUserId: (req: Request) => Promise<string | null>
}

export function requireUser<Req extends Request = Request>(
  getSessionUserId: SessionDeps["getSessionUserId"],
  handler: (req: Req, res: Response, authUserId: string) => Promise<void>,
) {
  return async function guarded(req: Req, res: Response): Promise<void> {
    const authUserId = await getSessionUserId(req)
    if (!authUserId) {
      res.status(401).json({ error: "Not authenticated" })
      return
    }
    await handler(req, res, authUserId)
  }
}
