// Purpose: Transaction parsing helpers
// Solana-specific: Parses Solana txs for account creation and close instructions
// Safety: Only parses, never assumes intent

import {
  ParsedTransactionWithMeta,
  ParsedInstruction,
  SystemProgram,
} from "@solana/web3.js";

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
