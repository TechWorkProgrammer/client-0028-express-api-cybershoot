import { Database } from "bun:sqlite";

export const db = new Database("data/prambanan.db", {
  create: true,
  strict: true,
});
