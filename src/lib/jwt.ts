import { sign, verify } from "jsonwebtoken";
import { Env } from "../config/env";

export const signJwt = (
  payload: object,
  type: "access" | "refresh",
  expiresIn?: string
) => {
  if (!expiresIn) {
    if (type === "access") {
      expiresIn = `${Env.JWT_ACCESS_EXP_MINUTES}m`;
    } else {
      expiresIn = `${Env.JWT_REFRESH_EXP_DAYS}d`;
    }
  }

  try {
    const token = sign(payload, Env.JWT_SECRET, {
      expiresIn,
    });

    return token;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const verifyJwt = async (token: string) => {
  try {
    const decoded = verify(token, Env.JWT_SECRET) as {
      id: number;
    };

    return decoded;
  } catch (error) {
    return Promise.reject(error);
  }
};
