import { rtsLookup } from './rts-table';

export interface E1RMResult {
  e1rm: number;
  method: 'rts' | 'brzycki_epley_avg' | 'identity';
  warning?: string;
}

/**
 * Brzycki e1RM formula.
 * Valid for reps 1–10; less reliable above 10.
 * Division by zero at reps = 37.
 */
export function brzycki(weight: number, reps: number): number {
  if (reps >= 37) return weight * 36; // cap to avoid division by zero
  return weight * 36 / (37 - reps);
}

/**
 * Epley e1RM formula.
 */
export function epley(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

/**
 * Compute e1RM for a single set.
 *
 * Strategy:
 * 1. If RPE provided and within RTS table bounds → use RTS method
 * 2. Otherwise → average of Brzycki and Epley
 * 3. Special case: 1 rep with no RPE → weight itself
 */
export function computeE1RM(weight: number, reps: number, rpe?: number): E1RMResult {
  if (weight <= 0 || reps < 1) {
    return { e1rm: 0, method: 'identity', warning: 'Invalid weight or reps' };
  }

  // RPE-based: try RTS lookup
  if (rpe !== undefined) {
    const percent = rtsLookup(rpe, reps);
    if (percent !== undefined && percent > 0) {
      return {
        e1rm: round2(weight / (percent / 100)),
        method: 'rts',
      };
    }
    // Fallback: RPE provided but outside table range
  }

  // Special case: single rep without RPE
  if (reps === 1) {
    return { e1rm: weight, method: 'identity' };
  }

  // Non-RPE: average of Brzycki and Epley
  const b = brzycki(weight, reps);
  const e = epley(weight, reps);
  const avg = (b + e) / 2;

  const result: E1RMResult = {
    e1rm: round2(avg),
    method: 'brzycki_epley_avg',
  };

  if (reps > 10) {
    result.warning = 'Reps > 10: e1RM estimate less reliable';
  }

  return result;
}

/**
 * Get the max e1RM from a list of sets for an exercise.
 */
export function maxE1RMFromSets(sets: Array<{ weight: number; reps: number; rpe?: number }>): E1RMResult | null {
  if (sets.length === 0) return null;

  let best: E1RMResult | null = null;

  for (const set of sets) {
    const result = computeE1RM(set.weight, set.reps, set.rpe);
    if (result.e1rm > 0 && (best === null || result.e1rm > best.e1rm)) {
      best = result;
    }
  }

  return best;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
