import axios from "axios";
import { logger } from "../utils/logger";

/**
 * Send alert via Webhook (Discord/Telegram)
 */
export async function sendAlert(message: string) {
  const webhookUrl = process.env.KORA_ALERT_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.info(`[ALERT-STUB] ${message}`);
    return;
  }

  try {
    // Basic support for Discord/Slack-style JSON webhooks
    await axios.post(webhookUrl, {
      content: message, // Discord
      text: message, // Slack/Telegram potentially
    });
    logger.info(`[ALERT-SENT] Webhook notification delivered.`);
  } catch (err) {
    logger.error(`[ALERT-ERROR] Failed to send webhook: ${err}`);
  }
}
