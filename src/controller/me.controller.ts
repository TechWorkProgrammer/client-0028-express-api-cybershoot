import { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/error";
import { sendResponse } from "../lib/response";
import { getUser, updateUserScore } from "../services/user.service";

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const { id: userId } = res.locals.user;

    const user = await getUser(userId);

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    sendResponse(res, 200, "User found", { user });
  } catch (error) {
    next(error);
  }
}

export async function updateScore(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id: userId } = res.locals.user;
    const {
      encrypted_score: encryptedScore,
      time_since_last_submission: timeSinceLastSubmission,
    } = req.body;

    if (!encryptedScore || !timeSinceLastSubmission) {
      throw new HttpError(422, "Missing required fields");
    }

    const success = await updateUserScore(
      userId,
      encryptedScore,
      timeSinceLastSubmission
    );

    if (!success) {
      throw new HttpError(400, "Invalid score data");
    }

    sendResponse(res, 200, "Score updated");
  } catch (error) {
    next(error);
  }
}
