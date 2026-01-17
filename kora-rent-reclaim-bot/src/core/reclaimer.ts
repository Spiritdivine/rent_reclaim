// Purpose: Executes safe rent reclaim actions for eligible accounts
// Solana-specific: Only reclaims via explicit close instructions or closed accounts
// Safety: Supports dry-run, logs every action, never batches blindly

import { logReclaimAction } from "../db/reclaim.repo";
import { logger } from "../utils/logger";

/**
 * Attempts to reclaim rent from an eligible account.
 * Only executes if eligibility is confirmed.
 * Supports dry-run mode.
 */
export async function reclaimAccount({
  // Edge case: Never batch blindly. Each reclaim is logged and auditable. Dry-run mode is always available.
  account_pubkey,
  reason,
  lamports,
  eligible,
  dryRun = false,
  network = "mainnet",
}: {
  account_pubkey: string;
  reason: string;
  lamports: number;
  eligible: boolean;
  dryRun?: boolean;
  network?: "devnet" | "mainnet";
}) {
  if (!eligible) {
    logger.info(`[SKIP] Account ${account_pubkey} not eligible: ${reason}`);
    return;
  }
  if (dryRun) {
    logger.info(
      `[DRY-RUN] Would reclaim ${lamports} lamports from ${account_pubkey}: ${reason}`,
    );
    logReclaimAction({
      account_pubkey,
      reclaimed_lamports: lamports,
      reason,
      dry_run: true,
    });
    return;
  }
  // ...existing code to build and send signed transaction for reclaim...
  // Log tx signature and action
  // logReclaimAction({ account_pubkey, reclaimed_lamports: lamports, reason, tx_signature, dry_run: false });
}
