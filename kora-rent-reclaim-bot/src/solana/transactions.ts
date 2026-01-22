// Purpose: Transaction parsing helpers
// Solana-specific: Parses Solana txs for account creation and close instructions
// Safety: Only parses, never assumes intent

import {
  ParsedTransactionWithMeta,
  ParsedInstruction,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { createCloseAccountInstruction } from "@solana/spl-token";

export function parseAccountCreation(tx: ParsedTransactionWithMeta): Array<{
  account_pubkey: string;
  owner_program: string;
  funded_lamports: number;
}> {
  const creations: Array<{
    account_pubkey: string;
    owner_program: string;
    funded_lamports: number;
  }> = [];

  for (const ix of tx.transaction.message.instructions) {
    if (
      ix.programId.toBase58() === SystemProgram.programId.toBase58() &&
      "parsed" in ix
    ) {
      const parsed = (ix as ParsedInstruction).parsed;
      if (parsed.type === "createAccount") {
        creations.push({
          account_pubkey: parsed.info.newAccount,
          owner_program: parsed.info.owner,
          funded_lamports: parsed.info.lamports,
        });
      }
    }
  }

  return creations;
}

export function parseCloseInstruction(tx: ParsedTransactionWithMeta): Array<{
  account_pubkey: string;
  destination: string;
}> {
  const closes: Array<{
    account_pubkey: string;
    destination: string;
  }> = [];

  // This is generic and might need program-specific logic
  // For SPL Token, we'd check the Token Program
  for (const ix of tx.transaction.message.instructions) {
    if ("parsed" in ix) {
      const parsed = (ix as ParsedInstruction).parsed;
      if (parsed.type === "closeAccount") {
        closes.push({
          account_pubkey: parsed.info.account,
          destination: parsed.info.destination,
        });
      }
    }
  }

  return closes;
}

/**
 * Creates an instruction to reclaim rent from an account.
 * For SPL Token accounts, uses closeAccount.
 * For System accounts (0 data), uses transfer.
 */
export function createReclaimInstruction({
  accountPubkey,
  destinationPubkey,
  authorityPubkey,
  isToken = false,
  lamports = 0,
}: {
  accountPubkey: string;
  destinationPubkey: string;
  authorityPubkey: string;
  isToken?: boolean;
  lamports?: number;
}): TransactionInstruction {
  if (isToken) {
    return createCloseAccountInstruction(
      new PublicKey(accountPubkey),
      new PublicKey(destinationPubkey),
      new PublicKey(authorityPubkey),
    );
  } else {
    // For system accounts, we just transfer everything
    return SystemProgram.transfer({
      fromPubkey: new PublicKey(accountPubkey),
      toPubkey: new PublicKey(destinationPubkey),
      lamports,
    });
  }
}
