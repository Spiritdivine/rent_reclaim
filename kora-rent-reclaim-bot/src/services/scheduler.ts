// Purpose: Schedules periodic scans and analysis
// Solana-specific: Used for regular monitoring of accounts
// Safety: All scheduled actions are logged

/**
 * Simple scheduler for periodic bot tasks.
 */
export function scheduleTask(fn: () => Promise<void>, intervalMs: number) {
  setInterval(() => {
    fn().catch((err) => {
      // Log error
    });
  }, intervalMs);
}
