/**
 * Normalize an exercise name for comparison and grouping.
 * Lowercases, trims, and collapses whitespace.
 */
export function normalizeExerciseName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Main lift patterns for auto-detection.
 */
const MAIN_LIFT_PATTERNS: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /\bsquat\b/i, canonical: 'squat' },
  { pattern: /\bbench\b/i, canonical: 'bench' },
  { pattern: /\bdeadlift\b/i, canonical: 'deadlift' },
  { pattern: /\b(overhead\s*press|ohp)\b/i, canonical: 'overhead press' },
];

/**
 * Determine if an exercise is a "main lift" for dashboard purposes.
 * Uses pattern matching on name, or manual override.
 */
export function isMainLift(name: string, manualOverride?: boolean): boolean {
  if (manualOverride !== undefined) return manualOverride;
  return MAIN_LIFT_PATTERNS.some(p => p.pattern.test(name));
}

/**
 * Get the canonical main lift name, if the exercise matches.
 */
export function getCanonicalLiftName(name: string): string | null {
  for (const { pattern, canonical } of MAIN_LIFT_PATTERNS) {
    if (pattern.test(name)) return canonical;
  }
  return null;
}
