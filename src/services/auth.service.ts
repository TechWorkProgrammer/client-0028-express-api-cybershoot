import { signJwt, verifyJwt } from "../lib/jwt";
import { createUser, findUserById } from "../repositories/user.repositories";

export function register(id: number, username: string) {
  const user = findUserById(id);

  if (user) {
    return null;
  }

  createUser({
    id,
    username,
  });

  return true;
}

export async function login(
  id: number,
  accessTokenExpiresIn?: string,
  refreshTokenExpiresIn?: string
) {
  const user = findUserById(id);

  if (!user) {
    return null;
  }

  const accessToken = await signJwt({ id: user.id }, "access", accessTokenExpiresIn);
  const refreshToken = await signJwt(
    { id: user.id },
    "refresh",
    refreshTokenExpiresIn
  );

  return {
    accessToken,
    refreshToken,
  };
}

export async function createAccessToken(refreshToken: string) {
  const payload = await verifyJwt(refreshToken);

  if (!payload) {
    return null;
  }

  const user = findUserById(payload.id);

  if (!user) {
    return null;
  }

  const accessToken = await signJwt({ id: user.id }, "access");

  return {
    accessToken,
  };
}
