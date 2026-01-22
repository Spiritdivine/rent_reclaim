-- Purpose: SQLite schema for Kora rent reclaim bot
-- Solana-specific: Tracks sponsored accounts and reclaim history
-- Safety: All actions are auditable, no silent changes

CREATE TABLE IF NOT EXISTS sponsored_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_pubkey TEXT NOT NULL UNIQUE,
    owner_program TEXT NOT NULL,
    funded_lamports INTEGER NOT NULL,
    creation_slot INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity_slot INTEGER,
    is_closed BOOLEAN DEFAULT 0,
    is_executable BOOLEAN DEFAULT 0,
    data_size INTEGER,
    lamports INTEGER
);

CREATE TABLE IF NOT EXISTS reclaim_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_pubkey TEXT NOT NULL,
    reclaimed_lamports INTEGER NOT NULL,
    reason TEXT NOT NULL,
    tx_signature TEXT,
    reclaimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    dry_run BOOLEAN DEFAULT 0
);
