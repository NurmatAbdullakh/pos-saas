import type { NextFunction, RequestHandler, Request, Response } from "express";

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export function asyncRequestHandler(callback: AsyncController):RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await callback(req, res, next)
    } catch (error: unknown) {
      next(error);
    }
  };
}