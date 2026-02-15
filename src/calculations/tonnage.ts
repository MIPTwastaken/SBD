import type { TrainingSet, Exercise, Session } from '../schemas';

/** Tonnage for a single set. */
export function setTonnage(set: TrainingSet): number {
  return set.weight * set.reps;
}

/** Total tonnage for an exercise (sum of all sets). */
export function exerciseTonnage(exercise: Exercise): number {
  return exercise.sets.reduce((sum, set) => sum + setTonnage(set), 0);
}

/** Total tonnage for a session (sum of all exercises). */
export function sessionTonnage(session: Session): number {
  return session.exercises.reduce((sum, ex) => sum + exerciseTonnage(ex), 0);
}

/** Tonnage breakdown by tier for a session. */
export function tonnageByTier(session: Session): Record<string, number> {
  const result: Record<string, number> = { T1: 0, T2: 0, T3: 0 };
  for (const ex of session.exercises) {
    result[ex.tier] = (result[ex.tier] || 0) + exerciseTonnage(ex);
  }
  return result;
}

/** Tonnage breakdown by exercise name for a session. */
export function tonnageByExercise(session: Session): Record<string, number> {
  const result: Record<string, number> = {};
  for (const ex of session.exercises) {
    const key = ex.name.toLowerCase().trim();
    result[key] = (result[key] || 0) + exerciseTonnage(ex);
  }
  return result;
}
