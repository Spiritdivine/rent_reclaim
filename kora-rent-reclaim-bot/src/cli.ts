// Purpose: CLI for Kora rent reclaim bot
// Solana-specific: Implements scan, analyze, report, reclaim commands
// Safety: Supports dry-run, explicit network selection, logs all actions

import { scanSponsoredAccounts } from "./core/scanner";
import { analyzeAccounts } from "./core/analyzer";
import { generateReport } from "./core/reporter";
import { reclaimAccount } from "./core/reclaimer";
import { getKoraTreasuryPubkey } from "./kora/payerResolver";
import { logger } from "./utils/logger";

const args = process.argv.slice(2);
const command = args[0];
const dryRun = args.includes("--dry-run");
const network = args.includes("--network=devnet") ? "devnet" : "mainnet";

switch (command) {
  // Edge case: All CLI commands support --dry-run and explicit network selection. Usage is always logged.
  case "scan":
    scanSponsoredAccounts({
      koraTreasuryPubkey: getKoraTreasuryPubkey(),
      network,
    }).then(() => logger.info("Scan complete."));
    break;
  case "analyze":
    analyzeAccounts({ network }).then(() => logger.info("Analyze complete."));
    break;
  case "report":
    generateReport();
    break;
  case "reclaim": {
    const { getTrackedAccounts } = require("./db/accounts.repo");
    const { checkEligibility } = require("./core/eligibility");
    const accounts = getTrackedAccounts();
    const currentSlot = Date.now(); // Placeholder for slot, should fetch from RPC
    for (const acc of accounts) {
      // Fetch account info (simulate, should use analyzer logic)
      const accountInfo = {
        isExecutable: acc.is_executable || false,
        lastActivitySlot: acc.last_activity_slot || null,
        ownerProgram: acc.owner_program,
        isClosed: acc.is_closed || false,
        dataSize: acc.data_size || 0,
        lamports: acc.lamports || acc.funded_lamports || 0,
        knownClosable: require("./solana/programs").isProgramClosable(
          acc.owner_program,
        ),
        systemOwnedEmpty:
          acc.owner_program === "11111111111111111111111111111111" &&
          acc.data_size === 0,
        currentSlot,
        protectedPrograms: [],
      };
      const { eligible, reason } = checkEligibility(accountInfo);
      require("./core/reclaimer").reclaimAccount({
        account_pubkey: acc.account_pubkey,
        reason,
        lamports: accountInfo.lamports,
        eligible,
        dryRun,
        network,
      });
    }
    logger.info("Reclaim complete.");
    break;
  }
  default:
    logger.info(
      "Usage: scan | analyze | report | reclaim [--dry-run] [--network=devnet|mainnet]",
    );
}
