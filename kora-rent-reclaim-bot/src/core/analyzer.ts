// Edge case: Account info may be missing if account is closed or purged. Always mark as closed if not found.
// Purpose: Analyze tracked accounts for state and activity
// Solana-specific: Uses RPC to fetch account info, detects closed/executable/owner/data/lamports
// Safety: Updates last activity slot, never assumes account status

import { getConnection } from "../solana/connection";
import {
  getTrackedAccounts,
  updateAccountActivity,
  markAccountClosed,
} from "../db/accounts.repo";
import { logger } from "../utils/logger";
import { PublicKey } from "@solana/web3.js";
import type { TrackedAccount } from "../types/account";

/**
 * Analyze all tracked accounts for status and activity.
 * Updates DB with last activity slot and closed status.
 */
export async function analyzeAccounts({
  network = "mainnet",
}: {
  network?: "devnet" | "mainnet";
}) {
  const connection = getConnection(network);
  const accounts = (getTrackedAccounts() as TrackedAccount[]).filter(
    (acc) => !acc.is_closed,
  );

  for (const acc of accounts) {
    try {
      const pubkey = new PublicKey(acc.account_pubkey);
      const info = await connection.getAccountInfo(pubkey);

      if (!info) {
        markAccountClosed(acc.account_pubkey);
        logger.info(`Account ${acc.account_pubkey} is closed/purged.`);
        continue;
      }

      // Detect "activity" - for simplicity, we check if the lamports or owner changed
      // In a real bot, we might fetch signatures for the account specifically.
      const isExecutable = info.executable;
      const ownerProgram = info.owner.toBase58();
      const dataSize = info.data.length;
      const lamports = info.lamports;

      let lastActivitySlot = acc.last_activity_slot;

      // If balance changed since last scan, it's active
      if (acc.lamports !== null && acc.lamports !== lamports) {
        lastActivitySlot = await connection.getSlot("confirmed");
      }

      updateAccountActivity(
        acc.account_pubkey,
        lastActivitySlot || acc.creation_slot,
        {
          owner_program: ownerProgram,
          is_executable: isExecutable,
          data_size: dataSize,
          lamports,
        },
      );

      logger.info(
        `Analyzed ${acc.account_pubkey}: owner=${ownerProgram}, size=${dataSize}, lamports=${lamports}, activeSlot=${lastActivitySlot}`,
      );
    } catch (err) {
      logger.error(`Error analyzing account ${acc.account_pubkey}: ${err}`);
    }
  }
  logger.info("Analyze complete.");
}
