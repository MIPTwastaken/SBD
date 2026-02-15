import { useMemo } from 'react';
import { useSessionStore } from '../stores';
import { computeE1RM } from '../calculations';
import { isMainLift, getCanonicalLiftName } from '../utils/normalization';

export interface E1RMDataPoint {
  date: string;
  e1rm: number;
  sessionId: string;
}

export type E1RMTrends = Record<string, E1RMDataPoint[]>;

/**
 * Compute e1RM trend data for all main lifts across all sessions.
 */
export function useE1RMTrends(): E1RMTrends {
  const sessions = useSessionStore(s => s.sessions);

  return useMemo(() => {
    const trends: E1RMTrends = {};

    // Process sessions in chronological order for the chart
    const sorted = [...sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const session of sorted) {
      for (const exercise of session.exercises) {
        if (!isMainLift(exercise.name, exercise.isMainLift)) continue;

        const canonical = getCanonicalLiftName(exercise.name);
        if (!canonical) continue;

        let bestE1RM = 0;
        for (const set of exercise.sets) {
          const result = computeE1RM(set.weight, set.reps, set.rpe);
          if (result.e1rm > bestE1RM) bestE1RM = result.e1rm;
        }

        if (bestE1RM > 0) {
          if (!trends[canonical]) trends[canonical] = [];
          trends[canonical].push({
            date: session.date,
            e1rm: bestE1RM,
            sessionId: session.id,
          });
        }
      }
    }

    return trends;
  }, [sessions]);
}
