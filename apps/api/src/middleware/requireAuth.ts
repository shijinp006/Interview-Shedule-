import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { Auth } from "../auth";
import { UnauthorizedError } from "../errors";

/** Rejects with 401 unless a valid better-auth session is present. */
export function requireAuth(auth: Auth) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) throw new UnauthorizedError();
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
    next();
  };
}
