// Purpose: Sponsored accounts repository
// Solana-specific: Handles account tracking for rent reclaim
// Safety: All changes are auditable

import { db } from "./index";

export function addSponsoredAccount(account: {
  account_pubkey: string;
  owner_program: string;
  funded_lamports: number;
  creation_slot: number;
}) {
  const stmt = db.prepare(
    `INSERT INTO sponsored_accounts (account_pubkey, owner_program, funded_lamports, creation_slot) VALUES (?, ?, ?, ?)`,
  );
  stmt.run(
    account.account_pubkey,
    account.owner_program,
    account.funded_lamports,
    account.creation_slot,
  );
}

export function updateAccountActivity(
  account_pubkey: string,
  last_activity_slot: number,
) {
  const stmt = db.prepare(
    `UPDATE sponsored_accounts SET last_activity_slot = ? WHERE account_pubkey = ?`,
  );
  stmt.run(last_activity_slot, account_pubkey);
}

export function markAccountClosed(account_pubkey: string) {
  const stmt = db.prepare(
    `UPDATE sponsored_accounts SET is_closed = 1 WHERE account_pubkey = ?`,
  );
  stmt.run(account_pubkey);
}

export function getTrackedAccounts() {
  return db.prepare(`SELECT * FROM sponsored_accounts`).all();
}
