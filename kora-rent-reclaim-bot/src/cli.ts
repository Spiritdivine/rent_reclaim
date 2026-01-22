// Purpose: CLI for Kora rent reclaim bot
// Solana-specific: Implements scan, analyze, report, reclaim commands
// Safety: Supports dry-run, explicit network selection, logs all actions

import { migrate } from "./db/index";
import { scanSponsoredAccounts } from "./core/scanner";
import { analyzeAccounts } from "./core/analyzer";
import { generateReport } from "./core/reporter";
import { reclaimAllEligible } from "./core/reclaimer";
import { startBotDaemon } from "./services/scheduler";
import { startWebhookServer } from "./services/webhook";
import { protectAccount, unprotectAccount } from "./db/protection.repo";
import { getKoraTreasuryPubkey } from "./kora/payerResolver";
import { logger } from "./utils/logger";

async function main() {
  // Initialize database
  migrate();

  const args = process.argv.slice(2);
  const command = args[0];
  const dryRun = args.includes("--dry-run");
  const network =
    (args.find((a) => a.startsWith("--network="))?.split("=")[1] as
      | "devnet"
      | "mainnet") || "mainnet";

  try {
    switch (command) {
      case "scan":
        await scanSponsoredAccounts({
          koraTreasuryPubkey: getKoraTreasuryPubkey(),
          network,
        });
        break;
      case "analyze":
        await analyzeAccounts({ network });
        break;
      case "report":
        generateReport();
        break;
      case "reclaim":
        await reclaimAllEligible({ dryRun, network });
        break;
      case "daemon":
        startBotDaemon({ network, dryRun });
        break;
      case "server":
        startWebhookServer(3000);
        break;
      case "protect":
        if (args[1]) {
          protectAccount(args[1], args[2] || "Manual protection");
          logger.info(`Protected ${args[1]}`);
        }
        break;
      case "unprotect":
        if (args[1]) {
          unprotectAccount(args[1]);
          logger.info(`Unprotected ${args[1]}`);
        }
        break;
      default:
        logger.info(
          "Usage: scan | analyze | report | reclaim | daemon | server | protect <pubkey> | unprotect <pubkey> [--dry-run] [--network=devnet|mainnet]",
        );
    }
  } catch (err) {
    logger.error(`Critical error during command ${command}: ${err}`);
    process.exit(1);
  }
}

main();
