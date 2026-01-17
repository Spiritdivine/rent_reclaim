// Purpose: DB connection and helpers for SQLite
// Solana-specific: Used for tracking sponsored accounts and reclaim actions
// Safety: All DB actions are logged and auditable

import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "rent_reclaim.sqlite");
export const db = new Database(dbPath);

export function migrate() {
  const schema = require("fs").readFileSync(
    path.resolve(__dirname, "schema.sql"),
    "utf8",
  );
  db.exec(schema);
}
