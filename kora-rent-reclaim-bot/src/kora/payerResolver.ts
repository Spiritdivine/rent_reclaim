// Purpose: Resolves Kora payer wallet for sponsorship detection
// Solana-specific: Explicitly models Kora behavior
// Safety: All logic is explained, no silent assumptions

/**
 * Returns the Kora treasury pubkey for sponsorship checks.
 * In production, this should be loaded from config or env.
 */
export function getKoraTreasuryPubkey(): string {
  // In production, load from environment variable or config
  const pubkey = process.env.KORA_TREASURY_PUBKEY;
  if (!pubkey) {
    throw new Error("KORA_TREASURY_PUBKEY not set in environment");
  }
  return pubkey;
}
