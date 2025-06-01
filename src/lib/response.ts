import { Response } from "express";

export function sendResponse(
  res: Response,
  statusCode: number,
  message: string,
  payload?: Record<string, unknown>
) {
  res.status(statusCode).send({
    message,
    payload,
  });
}
