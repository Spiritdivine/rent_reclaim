import { db } from "../db/index";

export function getLastSignature(): string | null {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = 'last_signature'")
    .get() as { value: string } | undefined;
  return row ? row.value : null;
}

export function saveLastSignature(signature: string) {
  db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('last_signature', ?)",
  ).run(signature);
}
