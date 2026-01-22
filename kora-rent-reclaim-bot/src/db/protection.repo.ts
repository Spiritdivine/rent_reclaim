import { db } from "./index";

export function isAccountProtected(pubkey: string): boolean {
  const row = db
    .prepare("SELECT 1 FROM protected_accounts WHERE account_pubkey = ?")
    .get(pubkey);
  return !!row;
}

export function protectAccount(pubkey: string, reason: string) {
  db.prepare(
    "INSERT OR IGNORE INTO protected_accounts (account_pubkey, reason) VALUES (?, ?)",
  ).run(pubkey, reason);
}

export function unprotectAccount(pubkey: string) {
  db.prepare("DELETE FROM protected_accounts WHERE account_pubkey = ?").run(
    pubkey,
  );
}
