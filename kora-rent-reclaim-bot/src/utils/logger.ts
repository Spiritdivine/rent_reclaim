// Purpose: Simple logger utility
// Solana-specific: Used for all bot actions and errors
// Safety: All logs are explicit, no silent actions

export const logger = {
  info: (msg: string) =>
    console.log(`[${new Date().toISOString()}] [INFO] ${msg}`),
  warn: (msg: string) =>
    console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`),
  error: (msg: string) =>
    console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`),
};
