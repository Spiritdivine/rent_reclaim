// Purpose: CLI for Kora rent reclaim bot
// Solana-specific: Implements scan, analyze, report, reclaim commands
// Safety: Supports dry-run, explicit network selection, logs all actions

import { migrate } from "./db/index";
import { scanSponsoredAccounts } from "./core/scanner";
import { analyzeAccounts } from "./core/analyzer";
import { generateReport } from "./core/reporter";
import { reclaimAllEligible } from "./core/reclaimer";
import { getKoraTreasuryPubkey } from "./kora/payerResolver";
import { logger } from "./utils/logger";

async function main() {
  // Initialize database
  migrate();

  const args = process.argv.slice(2);
  const command = args[0];
  const dryRun = args.includes("--dry-run");
  const network = args.includes("--network=devnet") ? "devnet" : "mainnet";

  try {
    switch (command) {
      case "scan":
        await scanSponsoredAccounts({
          koraTreasuryPubkey: getKoraTreasuryPubkey(),
          network,
        });
        logger.info("Scan complete.");
        break;
      case "analyze":
        await analyzeAccounts({ network });
        logger.info("Analyze complete.");
        break;
      case "report":
        generateReport();
        break;
      case "reclaim":
        await reclaimAllEligible({ dryRun, network });
        logger.info("Reclaim process finished.");
        break;
      default:
        logger.info(
          "Usage: scan | analyze | report | reclaim [--dry-run] [--network=devnet|mainnet]",
        );
    }
  } catch (err) {
    logger.error(`Critical error during command ${command}: ${err}`);
    process.exit(1);
  }
}

main();
