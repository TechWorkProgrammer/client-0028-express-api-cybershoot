import { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/error";
import { verifyJwt } from "../lib/jwt";
import { JsonWebTokenError } from "jsonwebtoken";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Try to get token from Authorization header first, then from query params
    let token = req.get("Authorization")?.split(" ")[1];
    
    // If no token in header, check query params
    if (!token && req.query.access_token) {
      token = req.query.access_token as string;
    }
    
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
