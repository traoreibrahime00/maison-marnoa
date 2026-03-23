import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { auth } from '../auth/auth';
import { HttpError } from './errors';

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export const requireAdmin: RequestHandler = asyncHandler(async (req, _res, next) => {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as Record<string, string>),
  });
  if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
    throw new HttpError(401, 'Unauthorized');
  }
  next();
});
