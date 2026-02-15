import type { Exercise, PRRecord } from '../schemas';
import { computeE1RM } from './e1rm';
import { normalizeExerciseName } from '../utils/normalization';

export interface PRCandidate {
  exerciseName: string;
  type: 'e1rm' | 'weight_at_reps';
  value: number;
  reps?: number;
  previousValue?: number;
}

/**
 * Detect PRs for exercises in a session.
 *
 * Checks:
 * 1. Best e1RM ever for the exercise
 * 2. Heaviest weight for each rep count (1–10)
 */
export function detectPRs(
  exercises: Exercise[],
  existingPRs: PRRecord[],
): PRCandidate[] {
  const newPRs: PRCandidate[] = [];

  for (const exercise of exercises) {
    const normalizedName = normalizeExerciseName(exercise.name);
    const exercisePRs = existingPRs.filter(
      pr => normalizeExerciseName(pr.exerciseName) === normalizedName
    );

    // 1. e1RM PR
    let bestE1RM = 0;
    for (const set of exercise.sets) {
      const result = computeE1RM(set.weight, set.reps, set.rpe);
      if (result.e1rm > bestE1RM) bestE1RM = result.e1rm;
    }

    if (bestE1RM > 0) {
      const existingE1RMPR = exercisePRs.find(pr => pr.type === 'e1rm');
      if (!existingE1RMPR || bestE1RM > existingE1RMPR.value) {
        newPRs.push({
          exerciseName: normalizedName,
          type: 'e1rm',
          value: bestE1RM,
          previousValue: existingE1RMPR?.value,
        });
      }
    }

    // 2. Weight-at-reps PRs (reps 1–10)
    const bestWeightAtReps: Record<number, number> = {};
    for (const set of exercise.sets) {
      if (set.reps >= 1 && set.reps <= 10) {
        if (!bestWeightAtReps[set.reps] || set.weight > bestWeightAtReps[set.reps]) {
          bestWeightAtReps[set.reps] = set.weight;
        }
      }
    }

    for (const [repsStr, weight] of Object.entries(bestWeightAtReps)) {
      const reps = Number(repsStr);
      const existing = exercisePRs.find(
        pr => pr.type === 'weight_at_reps' && pr.reps === reps
      );
      if (!existing || weight > existing.value) {
        newPRs.push({
          exerciseName: normalizedName,
          type: 'weight_at_reps',
          value: weight,
          reps,
          previousValue: existing?.value,
        });
      }
    }
  }

  return newPRs;
}

/**
 * Convert PR candidates to full PR records.
 */
export function candidatesToRecords(
  candidates: PRCandidate[],
  sessionId: string,
  sessionDate: string,
): PRRecord[] {
  return candidates.map(c => ({
    id: crypto.randomUUID(),
    exerciseName: c.exerciseName,
    type: c.type,
    value: c.value,
    reps: c.reps,
    sessionId,
    sessionDate,
    previousValue: c.previousValue,
  }));
}
