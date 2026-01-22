// Purpose: Type definitions for tracked accounts
// Solana-specific: Models account state for rent reclaim logic
// Safety: All fields are explicit, no silent assumptions

export interface TrackedAccount {
  account_pubkey: string;
  owner_program: string;
  funded_lamports: number;
  creation_slot: number;
  last_activity_slot?: number;
  is_closed?: boolean;
  is_executable?: boolean;
  data_size?: number;
  lamports?: number;
  created_at?: string;
}
