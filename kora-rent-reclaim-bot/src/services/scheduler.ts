// Purpose: Schedules periodic scans and analysis
// Solana-specific: Used for regular monitoring of accounts
// Safety: All scheduled actions are logged

import { logger } from "../utils/logger";
import { scanSponsoredAccounts } from "../core/scanner";
import { analyzeAccounts } from "../core/analyzer";
import { reclaimAllEligible } from "../core/reclaimer";
import { getKoraTreasuryPubkey } from "../kora/payerResolver";

/**
 * Simple scheduler for periodic bot tasks.
 */
export function scheduleTask(fn: () => Promise<void>, intervalMs: number) {
  logger.info(`Scheduled task to run every ${intervalMs}ms`);
  const wrapper = async () => {
    try {
      await fn();
    } catch (err) {
      logger.error(`Error in scheduled task: ${err}`);
    }
  };

  // Run immediately
  wrapper();

  return setInterval(wrapper, intervalMs);
}

/**
 * Starts the main bot loop.
 */
export function startBotDaemon({
  network,
  dryRun,
  intervalMs = 60000, // 1 minute default
}: {
  network: "devnet" | "mainnet";
  dryRun: boolean;
  intervalMs?: number;
}) {
  logger.info(`Starting bot daemon on ${network} (dryRun=${dryRun})...`);

  scheduleTask(async () => {
    logger.info("--- Starting periodic cycle ---");

    logger.info("Step 1: Scanning for new sponsored accounts...");
    await scanSponsoredAccounts({
      koraTreasuryPubkey: getKoraTreasuryPubkey(),
      network,
    });

    logger.info("Step 2: Analyzing tracked accounts...");
    await analyzeAccounts({ network });

    logger.info("Step 3: Attempting rent reclaim...");
    await reclaimAllEligible({ dryRun, network });

    logger.info("--- Cycle complete ---");
  }, intervalMs);
}
