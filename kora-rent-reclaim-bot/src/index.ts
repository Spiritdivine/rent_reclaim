// Purpose: Entrypoint for Kora rent reclaim bot
// Solana-specific: Loads config, starts CLI or service
// Safety: All actions are explicit, no silent logic

import { migrate } from "./db/index";
import { logger } from "./utils/logger";

// Run DB migration on startup
migrate();

logger.info("Kora Rent Reclaim Bot initialized.");
