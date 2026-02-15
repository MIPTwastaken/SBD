import { useMemo } from 'react';
import { useSessionStore, useSettingsStore } from '../stores';
import { checkE1RMDrop, checkRPEStreak } from '../calculations';
import type { FatigueFlag } from '../calculations';

/**
 * Compute active fatigue flags from session history.
 */
export function useFatigueFlags(): FatigueFlag[] {
  const sessions = useSessionStore(s => s.sessions);
  const settings = useSettingsStore(s => s.settings);

  return useMemo(() => {
    if (sessions.length === 0) return [];

    const flags: FatigueFlag[] = [];

    // Most recent session
    const latestSession = sessions[0]; // sessions sorted desc by date

    // e1RM drop check
    const dropFlags = checkE1RMDrop(
      latestSession,
      sessions,
      settings.fatigueDropThreshold
    );
    flags.push(...dropFlags);

    // RPE streak check
    const streakFlags = checkRPEStreak(sessions, settings.rpeStreakThreshold);
    flags.push(...streakFlags);

    return flags;
  }, [sessions, settings.fatigueDropThreshold, settings.rpeStreakThreshold]);
}
