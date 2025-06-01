import { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/error";
import { verifyJwt } from "../lib/jwt";
import { JsonWebTokenError } from "jsonwebtoken";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.get("Authorization")?.split(" ")[1];
    if (!token) {
      throw new HttpError(401, "Token missing");
    }

    const decoded = await verifyJwt(token);

    if (!decoded) {
      throw new HttpError(401, "Invalid token");
    }

    res.locals.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
}
