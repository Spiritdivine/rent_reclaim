// Purpose: Generates rent reclaim summaries and metrics
// Solana-specific: Reports on rent locked, reclaimed, idle by age, pending accounts
// Safety: All metrics are explicit, no silent actions

import { getTrackedAccounts } from "../db/accounts.repo";
import { getReclaimHistory } from "../db/reclaim.repo";
import { logger } from "../utils/logger";
import type { TrackedAccount } from "../types/account";

/**
 * Generates a summary report of rent metrics.
 */
export function generateReport() {
  const accounts = getTrackedAccounts() as TrackedAccount[];
  const history = getReclaimHistory() as Array<{
    reclaimed_lamports: number;
    [key: string]: any;
  }>;

  const totalLocked = accounts.reduce(
    (sum, acc) => sum + (acc.funded_lamports || 0),
    0,
  );
  const totalReclaimed = history.reduce(
    (sum, h) => sum + (h.reclaimed_lamports || 0),
    0,
  );

  const now = Date.now();
  const idleByAge: Record<string, number> = {
    "<30d": 0,
    "30-90d": 0,
    ">90d": 0,
  };

  for (const acc of accounts) {
    if (acc.is_closed) continue;

    const created = acc.created_at ? new Date(acc.created_at).getTime() : now;
    const ageDays = (now - created) / (1000 * 60 * 60 * 24);

    if (ageDays < 30) idleByAge["<30d"] += acc.funded_lamports || 0;
    else if (ageDays < 90) idleByAge["30-90d"] += acc.funded_lamports || 0;
    else idleByAge[">90d"] += acc.funded_lamports || 0;
  }

  const pending = accounts.filter((acc) => !acc.is_closed).length;

  logger.info("--- Rent Reclaim Report ---");
  logger.info(`Total rent locked: ${totalLocked} lamports`);
  logger.info(`Total reclaimed: ${totalReclaimed} lamports`);
  logger.info(`Idle rent by age: ${JSON.stringify(idleByAge)}`);
  logger.info(`Accounts pending reclaim: ${pending}`);
  logger.info("---------------------------");
}
