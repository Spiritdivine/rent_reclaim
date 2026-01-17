// Purpose: Strict eligibility engine for rent reclaim
// Solana-specific: Implements rules for safe reclaim, explains all decisions
// Safety: Never eligible if uncertain, logs reason for every decision

/**
 * Returns eligibility for reclaiming rent from an account.
 * All rules are explicit and conservative.
 */
export function checkEligibility(account: {
  // Edge case: If any rule is uncertain, default to NOT eligible. Never reclaim unless all checks pass.
  isExecutable: boolean;
  lastActivitySlot: number | null;
  ownerProgram: string;
  isClosed: boolean;
  dataSize: number;
  lamports: number;
  knownClosable: boolean;
  systemOwnedEmpty: boolean;
  currentSlot: number;
  protectedPrograms: string[];
}): { eligible: boolean; reason: string } {
  // ❌ Executable accounts → never
  if (account.isExecutable)
    return { eligible: false, reason: "Executable account" };
  // ❌ Recently active accounts
  if (
    account.lastActivitySlot &&
    account.currentSlot - account.lastActivitySlot < 10000
  )
    return { eligible: false, reason: "Recently active account" };
  // ❌ Unknown programs without close support
  if (!account.knownClosable && !account.systemOwnedEmpty && !account.isClosed)
    return { eligible: false, reason: "Unknown program, no close support" };
  // ✅ Already closed accounts (record only)
  if (account.isClosed)
    return { eligible: true, reason: "Account already closed" };
  // ✅ Known closable programs
  if (account.knownClosable)
    return { eligible: true, reason: "Known closable program" };
  // ✅ System-owned empty accounts
  if (account.systemOwnedEmpty)
    return { eligible: true, reason: "System-owned empty account" };
  // If uncertain → NOT eligible
  return { eligible: false, reason: "Uncertain eligibility" };
}
