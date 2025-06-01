import { HttpError } from "../lib/error";
import { decryptScore } from "../lib/obfuscation";
import User from "../model/user.model";
import {
  findUserById,
  findUsers,
  updateScore,
} from "../repositories/user.repositories";

export async function getUsers(): Promise<User[]> {
  const users = findUsers();

  return users;
}

export async function getUser(id: number): Promise<User | null> {
  const user = findUserById(id);

  return user;
}

export async function updateUserScore(
  id: number,
  encryptedScore: string,
  timeSinceLastSubmission: number
): Promise<boolean> {
  const user = findUserById(id);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const scoreData = decryptScore(encryptedScore);
  const [score, clientTime] = scoreData.split(":");

  if (timeSinceLastSubmission < 2) {
    throw new HttpError(400, "Submitting too quickly");
  }

  const scoreRate = parseInt(score) / timeSinceLastSubmission;
  if (scoreRate > 1000) {
    throw new HttpError(400, "Suspicious score increase");
  }

  const lastScore = user.total_score;
  if (lastScore === null) {
    throw new HttpError(500, "Internal server error");
  }

  if (parseInt(score) - lastScore > 1000 * timeSinceLastSubmission) {
    throw new HttpError(400, "Invalid score progression");
  }

  updateScore(id, user.total_score + parseInt(score));

  return true;
}
