import { useMemo } from 'react';
import { useSessionStore } from '../stores';

/**
 * Returns a deduplicated list of exercise names from session history,
 * sorted by frequency (most used first).
 */
export function useExerciseAutocomplete(): string[] {
  const sessions = useSessionStore(s => s.sessions);

  return useMemo(() => {
    const counts: Record<string, number> = {};

    for (const session of sessions) {
      for (const exercise of session.exercises) {
        const name = exercise.name.trim();
        if (name) {
          counts[name] = (counts[name] || 0) + 1;
        }
      }
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [sessions]);
}
