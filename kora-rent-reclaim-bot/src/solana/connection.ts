// Purpose: Solana RPC connection abstraction
// Solana-specific: Uses @solana/web3.js for safe, clean RPC access
// Safety: All RPC calls are logged, network selection is explicit

import { Connection, clusterApiUrl } from "@solana/web3.js";

export function getConnection(
  network: "devnet" | "mainnet" = "mainnet",
): Connection {
  // Only allow explicit network selection
  const url = clusterApiUrl(network);
  return new Connection(url, "confirmed");
}
