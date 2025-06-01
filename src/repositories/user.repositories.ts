import { db } from "../db";
import User from "../model/user.model";

export function findUsers() {
  const query = db.query("SELECT * FROM users").as(User);
  const users = query.all();

  return users;
}

export function findUserById(id: number) {
  const query = db.query("SELECT * FROM users WHERE id = $id").as(User);
  const user = query.get(id);

  return user;
}

export function createUser({ id, username }: Omit<User, "total_score">) {
  const query = db.query(
    "INSERT INTO users (id, username) VALUES ($id, $username)"
  );

  query.run(id, username);
}

export function updateScore(id: number, score: number) {
  const query = db.query("UPDATE users SET total_score = $score WHERE id = $id");

  query.run(score, id);
}
