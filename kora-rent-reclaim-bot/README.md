# Kora Rent Reclaim Bot

Production-grade Solana rent reclaim automation for Kora node operators.

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

2. **Set the Kora treasury public key (required):**
   - On Windows PowerShell:
     ```powershell
     $env:KORA_TREASURY_PUBKEY="9gHQGPYFx6JXuLGEaWh1WbTBKyd3TBo88kuysJzfWnd9"
     ```
   - On Linux/macOS:
     ```sh
     export KORA_TREASURY_PUBKEY=YourKoraTreasuryPubkeyHere
     ```

3. **Run CLI commands:**
   - Using npm scripts (from inside the `kora-rent-reclaim-bot` folder):
     ```sh
     npm run scan -- --network=devnet
     npm run analyze -- --network=devnet
     npm run report
     npm run reclaim -- --dry-run --network=devnet
     ```
   - Direct execution with TypeScript:
     ```sh
     npx ts-node src/cli.ts scan --network=devnet
     ```

4. **Options:**
   - `--dry-run` : Simulate actions, no transactions sent
   - `--network=devnet|mainnet` : Select Solana cluster

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
