import { Database } from "bun:sqlite";
import fs from "fs";

const db = new Database("data/prambanan.db", {
  create: true,
});

const migrate = () => {
  const files = fs.readdirSync("src/db/migrations").sort();

  for (const file of files) {
    const sql = fs.readFileSync(`src/db/migrations/${file}`, "utf-8");
    db.exec(sql);

    console.log(`Migrated: ${file}`);
  }
};

migrate();
