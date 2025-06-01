import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { logger } from "../config/logger";
import { HttpError } from "../lib/error";
import { sendResponse } from "../lib/response";

export const unknownEndpoint = (req: Request, res: Response) => {
  sendResponse(res, 404, "Route Not Found");
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error);

  if (error instanceof HttpError) {
    sendResponse(res, error.status, error.message, { error });
    return;
  }

  if (error instanceof JsonWebTokenError) {
    sendResponse(res, 401, "Unauthorized", {
      error: {
        name: error.name,
        message: error.message,
        expired_at:
          error instanceof TokenExpiredError ? error.expiredAt : undefined,
      },
    });
    return;
  }

  sendResponse(res, 500, "Internal Server Error", { error });
};
