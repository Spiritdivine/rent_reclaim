// Purpose: Schedules periodic scans and analysis
// Solana-specific: Used for regular monitoring of accounts
// Safety: All scheduled actions are logged

import { logger } from "../utils/logger";

/**
 * Simple scheduler for periodic bot tasks.
 */
export function scheduleTask(fn: () => Promise<void>, intervalMs: number) {
  logger.info(`Scheduled task to run every ${intervalMs}ms`);
  setInterval(() => {
    fn().catch((err) => {
      logger.error(`Error in scheduled task: ${err}`);
    });
  }, intervalMs);
}
