import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/error";
import { sendResponse } from "../lib/response";
import { createAccessToken } from "../services/auth.service";

export async function refreshTokens(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refresh_token: refreshToken } = req.body;

    if (!refreshToken) {
      throw new HttpError(422, "Refresh token is required");
    }

    const accessToken = await createAccessToken(refreshToken);

    if (!accessToken) {
      throw new HttpError(401, "Unauthorized");
    }

    sendResponse(res, 200, 'Access token refreshed', accessToken);
  } catch (error) {
    next(error);
  }
}
