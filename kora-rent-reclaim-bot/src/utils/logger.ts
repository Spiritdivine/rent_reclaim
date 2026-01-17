// Purpose: Simple logger utility
// Solana-specific: Used for all bot actions and errors
// Safety: All logs are explicit, no silent actions

export const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
};
