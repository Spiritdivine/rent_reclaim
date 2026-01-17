// Purpose: Known program logic helpers
// Solana-specific: Maps program IDs to close support
// Safety: Only marks as closable if explicit support

export const KNOWN_CLOSABLE_PROGRAMS: Record<string, boolean> = {
  // Add known closable program IDs here
  // 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': true, // SPL Token
};

export function isProgramClosable(programId: string): boolean {
  return !!KNOWN_CLOSABLE_PROGRAMS[programId];
}
