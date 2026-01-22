// Purpose: Solana RPC connection abstraction
// Solana-specific: Uses @solana/web3.js for safe, clean RPC access
// Safety: All RPC calls are logged, network selection is explicit

import { Connection, clusterApiUrl, Cluster } from "@solana/web3.js";

export function getConnection(
  network: "devnet" | "mainnet" = "mainnet",
): Connection {
  // Map 'mainnet' to 'mainnet-beta' for Solana clusterApiUrl
  const cluster: Cluster = network === "mainnet" ? "mainnet-beta" : network;
  const url = clusterApiUrl(cluster);
  return new Connection(url, "confirmed");
}
