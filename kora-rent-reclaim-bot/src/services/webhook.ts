import express from "express";
import bodyParser from "body-parser";
import { logger } from "../utils/logger";
import { generateReport } from "../core/reporter";
import { scanSponsoredAccounts } from "../core/scanner";
import { reclaimAllEligible } from "../core/reclaimer";
import { getKoraTreasuryPubkey } from "../kora/payerResolver";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

const TELEGRAM_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "<TELEGRAM BOT TOKEN/>";

/**
 * Handles incoming Telegram webhooks.
 * Supports commands: /report, /scan, /reclaim
 */
app.post("/telegram/webhook", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.text) {
    return res.sendStatus(200);
  }

  const chatId = message.chat.id;
  const text = message.text;
  const network = "devnet"; // Default to devnet for safety

  logger.info(`[TELEGRAM] Received message from ${chatId}: ${text}`);

  try {
    if (text === "/start") {
      await sendTelegramMessage(
        chatId,
        "Welcome to Kora Rent Reclaim Bot! Commands: /report, /scan, /reclaim",
      );
    } else if (text === "/report") {
      generateReport();
      await sendTelegramMessage(
        chatId,
        "Report generated! Check bot console for details.",
      );
    } else if (text === "/scan") {
      await sendTelegramMessage(chatId, "Starting scan on devnet...");
      await scanSponsoredAccounts({
        koraTreasuryPubkey: getKoraTreasuryPubkey(),
        network,
      });
      await sendTelegramMessage(chatId, "Scan complete!");
    } else if (text === "/reclaim") {
      await sendTelegramMessage(
        chatId,
        "⚠️ Starting REAL rent reclaim on devnet. Transactions will be sent to the network.",
      );
      await reclaimAllEligible({ dryRun: false, network });
      await sendTelegramMessage(
        chatId,
        "✅ Reclaim process finished! Check logs or /report for results.",
      );
    }
  } catch (err) {
    logger.error(`[TELEGRAM-ERROR] ${err}`);
    await sendTelegramMessage(chatId, `Error: ${err}`);
  }

  res.sendStatus(200);
});

async function sendTelegramMessage(chatId: number, text: string) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text,
      },
    );
  } catch (err) {
    logger.error(`[TELEGRAM-SEND-ERROR] ${err}`);
  }
}

export function startWebhookServer(port: number = 3000) {
  app.listen(port, () => {
    logger.info(`Webhook server listening on port ${port}`);
  });
}
