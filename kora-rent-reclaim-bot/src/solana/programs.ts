// Purpose: Known program logic helpers
// Solana-specific: Maps program IDs to close support
// Safety: Only marks as closable if explicit support

export const KNOWN_CLOSABLE_PROGRAMS: Record<string, boolean> = {
  // SPL Token
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: true,
  // SPL Token-2022
  TokenzQdBNb9WvM9mWdiUed329qS7mTM6U64mBD8uX: true,
  // System Program (for empty accounts we can just transfer lamports out)
  "11111111111111111111111111111111": true,
};

export function isProgramClosable(programId: string): boolean {
  return !!KNOWN_CLOSABLE_PROGRAMS[programId];
}
