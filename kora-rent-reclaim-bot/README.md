# Kora Rent Reclaim Bot

Production-grade Solana rent reclaim automation for Kora node operators.

## How Kora Sponsorship Works

Kora provides a "sponsored transaction" infrastructure for Solana. When an application uses Kora, the Kora node can act as the **Fee Payer** for transactions.

### Rent Locking

On Solana, every account must maintain a minimum balance to be "rent-exempt". When a Kora-sponsored transaction creates a new account (e.g., a System Account or an SPL Associated Token Account):

1. The Kora Treasury pays the transaction fee.
2. The Kora Treasury provides the initial SOL balance required for rent exemption of the new account.

Over time, if these accounts are not closed, the SOL remains **locked** in the account. For node operators sponsoring thousands of transactions, this can lead to significant silent capital loss.

## The Reclaim Approach

This bot implements a multi-stage pipeline to recover locked SOL:

1. **Scanner**: Monitors the Kora Treasury's transaction history. It detects `SystemProgram.createAccount` instructions where the Treasury was the source of funds.
2. **Analyzer**: Periodically checks the status of discovered accounts. It marks accounts that have been purged (already closed) and tracks activity (balance changes).
3. **Eligibility Engine**: Uses conservative rules to determine if an account can be safely reclaimed:
   - Account is not executable (not a program).
   - Account has been idle (no activity for >10,000 slots).
   - Account owner is a "Known Closable" program (e.g., SPL Token) or is a System-owned empty account.
4. **Reclaimer**: Executes the actual reclaim transactions.
   - For SPL Token accounts: Sends a `CloseAccount` instruction.
   - For System accounts: Transfers lamports back to the Treasury.

### Safety Features

- **Dry-run mode**: Simulate all actions without sending transactions.
- **Auditable History**: Every reclaim action is logged in a local SQLite database with the reason and transaction signature.
- **Conservative Eligibility**: Default state is "not eligible" unless all safety checks pass.

## Prerequisites

- Node.js (v18+ recommended)
- npm
- SQLite3 (for DB inspection, optional)
- Solana RPC endpoint access

## Setup

1. **Clone the repository and install dependencies:**

   ```sh
   git clone https://github.com/Spiritdivine/rent_reclaim.git
   cd rent_reclaim/kora-rent-reclaim-bot
   npm install
   ```

2. **Configure Environment:**
   - `KORA_TREASURY_PUBKEY`: The public key of your Kora node treasury.
   - `KORA_OPERATOR_SECRET`: (Optional) The base58-encoded secret key of the authority allowed to close accounts (required for actual reclaim).
   - `KORA_ALERT_WEBHOOK_URL`: (Optional) A Discord or Telegram webhook URL to receive real-time alerts.
   - `TELEGRAM_BOT_TOKEN`: (Optional) Required to enable the interactive Telegram Bot interface.

   - On Windows PowerShell:
     ```powershell
     $env:KORA_TREASURY_PUBKEY="9gHQGPYFx6JXuLGEaWh1WbTBKyd3TBo88kuysJzfWnd9"
     ```
     ```powershell
     $env:KORA_OPERATOR_SECRET="2dUHkHEopcEJE6hfPLtBsnKKZm3RGonQTRx5KKrECFMCjGoSamkwiEhS1rejfMuJQfGxx6FwhiLCPyqMTEHatyVo"
     ```
     ```powershell
     $env:TELEGRAM_BOT_TOKEN="8094812401:AAGFKOlcEb3zKXXXIKK9o6MxSD61rYhL_Qk"
     ```

3. **Run CLI commands:**
   - **Interactive Bot Server**: `npx ts-node src/cli.ts server` (Requires `TELEGRAM_BOT_TOKEN`. Note: `/reclaim` command in Telegram performs **REAL** reclaims).
   - **Daemon Mode**: `npx ts-node src/cli.ts daemon --network=devnet`
   - **Manual Scan**: `npm run scan -- --network=devnet`
   - **Analyze Data**: `npm run analyze -- --network=devnet`
   - **Generate Report**: `npm run report`
   - **Perform Reclaim**: `npm run reclaim -- --dry-run --network=devnet`
   - **Perform Real Reclaim**: `npm run reclaim -- --network=devnet`

4. **Options:**
   - `--dry-run` : Simulate actions, no transactions sent
   - `--network=devnet|mainnet` : Select Solana cluster

## Telegram Bot Commands

When running in `server` mode, you can interact with the bot via Telegram:

- `/start` : Get welcome message and available commands.
- `/report` : Generate and view a summary of rent locked and reclaimed.
- `/scan` : Trigger a manual scan for new sponsored accounts on devnet.
- `/reclaim` : **Warning:** Performs a **REAL** on-chain reclaim of eligible accounts.

## Safety & Auditability

- All actions are logged
- Dry-run mode is available
- All reclaim actions are auditable in the SQLite DB

## Directory Structure

See `kora-rent-reclaim-bot/` for all modules and their responsibilities.

## Troubleshooting

- Ensure your Solana RPC endpoint is reachable
- Ensure the Kora treasury pubkey is set in your environment
- For DB issues, delete `rent_reclaim.sqlite` to reset (will lose history)

---

For more details, see code comments in each module.
