export interface INOLResult {
  inol: number;
  warning?: string;
}

/**
 * Compute INOL for a single set.
 *
 * INOL = reps / (100 - intensityPercent)
 * intensityPercent = (weight / current1RM) * 100
 *
 * Edge cases:
 * - If current1RM is missing or <= 0, returns null (insufficient anchor)
 * - If intensityPercent >= 100, cap denominator to 1 to avoid infinity
 */
export function computeINOL(
  weight: number,
  reps: number,
  current1RM: number | null | undefined
): INOLResult | null {
  if (current1RM == null || current1RM <= 0) {
    return null; // insufficient anchor
  }

  const intensityPercent = (weight / current1RM) * 100;
  const denominator = Math.max(100 - intensityPercent, 1);
  const inol = reps / denominator;

  const result: INOLResult = {
    inol: Math.round(inol * 1000) / 1000,
  };

  if (intensityPercent >= 100) {
    result.warning = 'Intensity >= 100% of 1RM; INOL capped';
  }

  return result;
}

/**
 * Sum INOL across multiple sets for an exercise.
 */
export function exerciseINOL(
  sets: Array<{ weight: number; reps: number }>,
  current1RM: number | null | undefined
): INOLResult | null {
  if (current1RM == null || current1RM <= 0) return null;

  let total = 0;
  let hasWarning = false;

  for (const set of sets) {
    const result = computeINOL(set.weight, set.reps, current1RM);
    if (result) {
      total += result.inol;
      if (result.warning) hasWarning = true;
    }
  }

  return {
    inol: Math.round(total * 1000) / 1000,
    warning: hasWarning ? 'One or more sets at >= 100% intensity' : undefined,
  };
}
