// Purpose: Resolves Kora payer wallet for sponsorship detection
// Solana-specific: Explicitly models Kora behavior
// Safety: All logic is explained, no silent assumptions

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

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

/**
 * Returns the Kora operator keypair for signing reclaim transactions.
 * Returns null if not configured (safe default).
 */
export function getKoraOperatorKeypair(): Keypair | null {
  const secret = process.env.KORA_OPERATOR_SECRET;
  if (!secret) return null;
  try {
    return Keypair.fromSecretKey(bs58.decode(secret));
  } catch {
    return null;
  }
}
