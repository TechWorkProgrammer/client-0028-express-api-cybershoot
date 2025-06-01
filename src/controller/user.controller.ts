import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../lib/response";
import { getUsers } from "../services/user.service";

export async function fetchUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await getUsers();

    sendResponse(res, 200, "Users retrieved", { users });
  } catch (error) {
    next(error);
  }
}
