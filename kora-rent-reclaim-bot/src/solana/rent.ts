// Purpose: Rent exemption calculation helpers
// Solana-specific: Uses @solana/web3.js rent logic
// Safety: Only calculates, never assumes reclaim

import { Connection } from "@solana/web3.js";

export async function getRentExemption(
  connection: Connection,
  dataSize: number,
): Promise<number> {
  // Returns minimum lamports for rent exemption
  return await connection.getMinimumBalanceForRentExemption(dataSize);
}
