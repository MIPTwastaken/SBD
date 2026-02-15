import { useMemo } from 'react';
import { useSessionStore } from '../stores';
import { computeE1RM } from '../calculations';
import { isMainLift, getCanonicalLiftName } from '../utils/normalization';

export interface Anchor {
  lift: string;
  e1rm: number;
  date: string;
  sessionId: string;
}

/**
 * Derive current T1 e1RM anchors per main lift.
 * An anchor is the most recent T1 top-set e1RM for each main lift.
 */
export function useAnchors(): Anchor[] {
  const sessions = useSessionStore(s => s.sessions);

  return useMemo(() => {
    const anchors: Record<string, Anchor> = {};

    // Sessions are already sorted by date descending
    for (const session of sessions) {
      for (const exercise of session.exercises) {
        if (exercise.tier !== 'T1') continue;
        if (!isMainLift(exercise.name, exercise.isMainLift)) continue;

        const canonical = getCanonicalLiftName(exercise.name);
        if (!canonical) continue;
        if (anchors[canonical]) continue; // already have a more recent one

        let bestE1RM = 0;
        for (const set of exercise.sets) {
          const result = computeE1RM(set.weight, set.reps, set.rpe);
          if (result.e1rm > bestE1RM) bestE1RM = result.e1rm;
        }

        if (bestE1RM > 0) {
          anchors[canonical] = {
            lift: canonical,
            e1rm: bestE1RM,
            date: session.date,
            sessionId: session.id,
          };
        }
      }
    }

    return Object.values(anchors);
  }, [sessions]);
}
