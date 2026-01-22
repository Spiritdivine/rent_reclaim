// Purpose: Scans Solana transactions for Kora-sponsored account creations
// Solana-specific: Monitors fee payer == Kora treasury, parses account creation
// Safety: Never assumes all sponsored txs are account creation, logs all actions

import {
  PublicKey,
  SystemInstruction,
  SystemProgram,
  ParsedInstruction,
} from "@solana/web3.js";
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
  const treasuryKey = new PublicKey(koraTreasuryPubkey);

  // Fetch recent confirmed transactions for the treasury
  const signatures = await connection.getSignaturesForAddress(treasuryKey, {
    limit,
  });

  for (const sigInfo of signatures) {
    try {
      const tx = await connection.getParsedTransaction(sigInfo.signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || !tx.transaction || !tx.meta) continue;

      // Check fee payer
      const feePayer = tx.transaction.message.accountKeys[0].pubkey.toBase58();
      if (feePayer !== koraTreasuryPubkey) continue;

      // Parse account creation instructions from parsed instructions
      for (const ix of tx.transaction.message.instructions) {
        // We look for SystemProgram CreateAccount
        if (
          ix.programId.toBase58() !== SystemProgram.programId.toBase58() ||
          !("parsed" in ix)
        )
          continue;

        const parsed = (ix as ParsedInstruction).parsed;
        if (parsed.type === "createAccount") {
          const { newAccount, owner, lamports } = parsed.info;

          addSponsoredAccount({
            account_pubkey: newAccount,
            owner_program: owner,
            funded_lamports: lamports,
            creation_slot: tx.slot,
          });

          logger.info(
            `Sponsored account detected: ${newAccount}, owner: ${owner}, lamports: ${lamports}, slot: ${tx.slot}`,
          );
        }
      }
    } catch (err) {
      logger.error(`Error scanning tx ${sigInfo.signature}: ${err}`);
    }
  }
  logger.info("Scan complete.");
}
