// Purpose: Transaction parsing helpers
// Solana-specific: Parses Solana txs for account creation and close instructions
// Safety: Only parses, never assumes intent

import { TransactionResponse } from "@solana/web3.js";

export function parseAccountCreation(tx: TransactionResponse): Array<{
  account_pubkey: string;
  owner_program: string;
  funded_lamports: number;
}> {
  // ...existing code to parse account creation instructions...
  return [];
}

export function parseCloseInstruction(tx: TransactionResponse): Array<{
  account_pubkey: string;
  owner_program: string;
  lamports_returned: number;
}> {
  // ...existing code to parse close instructions...
  return [];
}
