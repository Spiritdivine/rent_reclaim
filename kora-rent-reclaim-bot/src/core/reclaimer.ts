// Purpose: Executes safe rent reclaim actions for eligible accounts
// Solana-specific: Only reclaims via explicit close instructions or closed accounts
// Safety: Supports dry-run, logs every action, never batches blindly

import {
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import { getConnection } from "../solana/connection";
import { getTrackedAccounts, markAccountClosed } from "../db/accounts.repo";
import { logReclaimAction } from "../db/reclaim.repo";
import { isAccountProtected } from "../db/protection.repo";
import { checkEligibility } from "./eligibility";
import { isProgramClosable } from "../solana/programs";
import { createReclaimInstruction } from "../solana/transactions";
import {
  getKoraOperatorKeypair,
  getKoraTreasuryPubkey,
} from "../kora/payerResolver";
import { logger } from "../utils/logger";
import { sendAlert } from "../services/alerts";
import type { TrackedAccount } from "../types/account";

/**
 * Reclaims rent from all eligible tracked accounts.
 */
export async function reclaimAllEligible({
  dryRun = false,
  network = "mainnet",
}: {
  dryRun?: boolean;
  network?: "devnet" | "mainnet";
}) {
  const accounts = getTrackedAccounts() as TrackedAccount[];
  const connection = getConnection(network);
  const currentSlot = await connection.getSlot("confirmed");

  for (const acc of accounts) {
    if (acc.is_closed) continue;
    if (isAccountProtected(acc.account_pubkey)) {
      logger.info(`[SKIP] Account ${acc.account_pubkey} is protected.`);
      continue;
    }

    const accountInfo = {
      isExecutable: !!acc.is_executable,
      lastActivitySlot: acc.last_activity_slot || null,
      ownerProgram: acc.owner_program,
      isClosed: !!acc.is_closed,
      dataSize: acc.data_size || 0,
      lamports: acc.lamports || acc.funded_lamports || 0,
      knownClosable: isProgramClosable(acc.owner_program),
      systemOwnedEmpty:
        acc.owner_program === "11111111111111111111111111111111" &&
        (acc.data_size === 0 || acc.data_size === null),
      currentSlot,
      protectedPrograms: [],
    };

    const { eligible, reason } = checkEligibility(accountInfo);

    await reclaimAccount({
      account_pubkey: acc.account_pubkey,
      owner_program: acc.owner_program,
      reason,
      lamports: accountInfo.lamports,
      eligible,
      dryRun,
      network,
    });
  }
}

/**
 * Attempts to reclaim rent from an eligible account.
 * Only executes if eligibility is confirmed.
 * Supports dry-run mode.
 */
export async function reclaimAccount({
  // Edge case: Never batch blindly. Each reclaim is logged and auditable. Dry-run mode is always available.
  account_pubkey,
  owner_program,
  reason,
  lamports,
  eligible,
  dryRun = false,
  network = "mainnet",
}: {
  account_pubkey: string;
  owner_program: string;
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

  const operator = getKoraOperatorKeypair();
  const treasury = getKoraTreasuryPubkey();

  if (!operator) {
    logger.warn(
      `[SKIP] Cannot reclaim ${account_pubkey}: Missing operator keypair for signing.`,
    );
    return;
  }

  try {
    const connection = getConnection(network);
    const isToken =
      owner_program === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" ||
      owner_program === "TokenzQdBNb9WvM9mWdiUed329qS7mTM6U64mBD8uX";

    const ix = createReclaimInstruction({
      accountPubkey: account_pubkey,
      destinationPubkey: treasury,
      authorityPubkey: operator.publicKey.toBase58(),
      isToken,
      lamports,
    });

    const tx = new Transaction().add(ix);
    const sig = await sendAndConfirmTransaction(connection, tx, [operator]);

    logger.info(`[RECLAIMED] Account ${account_pubkey}, signature: ${sig}`);

    await sendAlert(
      `💰 Reclaimed ${lamports} lamports from ${account_pubkey}. Signature: ${sig}`,
    );

    markAccountClosed(account_pubkey);
    logReclaimAction({
      account_pubkey,
      reclaimed_lamports: lamports,
      reason,
      tx_signature: sig,
      dry_run: false,
    });
  } catch (err) {
    logger.error(`[ERROR] Failed to reclaim ${account_pubkey}: ${err}`);
  }
}
