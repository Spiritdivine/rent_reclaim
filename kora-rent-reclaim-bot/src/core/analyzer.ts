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
  const currentSlot = await connection.getSlot("confirmed");

  for (const acc of accounts) {
    try {
      const pubkey = new PublicKey(acc.account_pubkey);
      const info = await connection.getAccountInfo(pubkey);

      if (!info) {
        markAccountClosed(acc.account_pubkey);
        logger.info(`Account ${acc.account_pubkey} is closed/purged.`);
        continue;
      }

      const isExecutable = info.executable;
      const ownerProgram = info.owner.toBase58();
      const dataSize = info.data.length;
      const lamports = info.lamports;

      updateAccountActivity(acc.account_pubkey, currentSlot, {
        owner_program: ownerProgram,
        is_executable: isExecutable,
        data_size: dataSize,
        lamports,
      });

      logger.info(
        `Analyzed ${acc.account_pubkey}: owner=${ownerProgram}, size=${dataSize}, lamports=${lamports}`,
      );
    } catch (err) {
      logger.error(`Error analyzing account ${acc.account_pubkey}: ${err}`);
    }
  }
  logger.info("Analyze complete.");
}
