// Purpose: Detects Kora-sponsored transactions
// Solana-specific: Matches fee payer to Kora treasury
// Safety: Never relies on heuristics alone, logs all assumptions

/**
 * Returns true if transaction was sponsored by Kora treasury.
 */
export function isKoraSponsoredTx(
  tx: { feePayer: string },
  koraTreasuryPubkey: string,
): boolean {
  return tx.feePayer === koraTreasuryPubkey;
}
