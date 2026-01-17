// Purpose: Reclaim history repository
// Solana-specific: Tracks all rent reclaim actions
// Safety: All actions are logged with reason and dry-run flag

import { db } from "./index";

export function logReclaimAction(action: {
  account_pubkey: string;
  reclaimed_lamports: number;
  reason: string;
  tx_signature?: string;
  dry_run?: boolean;
}) {
  const stmt = db.prepare(
    `INSERT INTO reclaim_history (account_pubkey, reclaimed_lamports, reason, tx_signature, dry_run) VALUES (?, ?, ?, ?, ?)`,
  );
  stmt.run(
    action.account_pubkey,
    action.reclaimed_lamports,
    action.reason,
    action.tx_signature || null,
    action.dry_run ? 1 : 0,
  );
}

export function getReclaimHistory() {
  return db.prepare(`SELECT * FROM reclaim_history`).all();
}
