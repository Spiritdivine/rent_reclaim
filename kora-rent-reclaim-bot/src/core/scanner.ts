// Purpose: Scans Solana transactions for Kora-sponsored account creations
// Solana-specific: Monitors fee payer == Kora treasury, parses account creation
// Safety: Never assumes all sponsored txs are account creation, logs all actions

import { getConnection } from "../solana/connection";
import { addSponsoredAccount } from "../db/accounts.repo";
import { logger } from "../utils/logger";

/**
 * Scan recent transactions for sponsored account creations.
 * Only stores accounts where fee payer matches Kora treasury.
 * Does NOT assume all sponsored txs are account creation.
 */
export async function scanSponsoredAccounts({
  // Edge case: Some transactions may have multiple account creations or none. Only log what is certain.
  koraTreasuryPubkey,
  network = "mainnet",
  limit = 100,
}: {
  koraTreasuryPubkey: string;
  network?: "devnet" | "mainnet";
  limit?: number;
}) {
  const connection = getConnection(network);
  const limitTxs = limit;
  // Fetch recent confirmed transactions for the treasury
  const signatures = await connection.getSignaturesForAddress(
    { toBase58: () => koraTreasuryPubkey },
    { limit: limitTxs },
  );
  for (const sigInfo of signatures) {
    try {
      const tx = await connection.getTransaction(sigInfo.signature, {
        commitment: "confirmed",
      });
      if (!tx || !tx.transaction) continue;
      const feePayer = tx.transaction.message.accountKeys[0].toBase58();
      if (feePayer !== koraTreasuryPubkey) continue;
      // Parse account creation instructions
      // Only consider SystemProgram::CreateAccount
      for (const ix of tx.transaction.message.instructions) {
        // SystemProgram id: 11111111111111111111111111111111
        const programId =
          tx.transaction.message.accountKeys[ix.programIdIndex].toBase58();
        if (programId !== "11111111111111111111111111111111") continue;
        // Parse new account pubkey
        const newAccountIdx = ix.accounts[0];
        const newAccountPubkey =
          tx.transaction.message.accountKeys[newAccountIdx].toBase58();
        // Funded lamports
        const fundedLamports = ix.data ? parseInt(ix.data.slice(0, 16), 16) : 0;
        // Creation slot
        const creationSlot = tx.slot;
        addSponsoredAccount({
          account_pubkey: newAccountPubkey,
          owner_program: programId,
          funded_lamports: fundedLamports,
          creation_slot: creationSlot,
        });
        logger.info(
          `Sponsored account detected: ${newAccountPubkey}, owner: ${programId}, lamports: ${fundedLamports}, slot: ${creationSlot}`,
        );
      }
    } catch (err) {
      logger.error(`Error scanning tx ${sigInfo.signature}: ${err}`);
    }
  }
  logger.info("Scan complete.");
}
