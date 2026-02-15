import type { Session } from '../schemas';
import { computeE1RM } from './e1rm';
import { normalizeExerciseName } from '../utils/normalization';
import { isMainLift } from '../utils/normalization';

export interface FatigueFlag {
  type: 'e1rm_drop' | 'rpe_streak';
  lift: string;
  message: string;
  details: Record<string, number | string>;
}

/**
 * Check for e1RM drop flag.
 *
 * Triggers when the current session's T1 top e1RM for a main lift
 * is > threshold below the rolling 28-day best for that lift.
 */
export function checkE1RMDrop(
  currentSession: Session,
  recentSessions: Session[],
  threshold: number = 0.05,
): FatigueFlag[] {
  const flags: FatigueFlag[] = [];
  const twentyEightDaysAgo = new Date(
    new Date(currentSession.date).getTime() - 28 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Get T1 exercises from current session that are main lifts
  const currentT1 = currentSession.exercises.filter(
    ex => ex.tier === 'T1' && isMainLift(ex.name, ex.isMainLift)
  );

  for (const exercise of currentT1) {
    const name = normalizeExerciseName(exercise.name);

    // Current session best e1RM for this lift
    let currentBest = 0;
    for (const set of exercise.sets) {
      const result = computeE1RM(set.weight, set.reps, set.rpe);
      if (result.e1rm > currentBest) currentBest = result.e1rm;
    }

    if (currentBest === 0) continue;

    // Rolling 28-day best (excluding current session)
    let rollingBest = 0;
    for (const session of recentSessions) {
      if (session.id === currentSession.id) continue;
      if (session.date < twentyEightDaysAgo) continue;
      if (session.date > currentSession.date) continue;

      for (const ex of session.exercises) {
        if (ex.tier !== 'T1') continue;
        if (normalizeExerciseName(ex.name) !== name) continue;

        for (const set of ex.sets) {
          const result = computeE1RM(set.weight, set.reps, set.rpe);
          if (result.e1rm > rollingBest) rollingBest = result.e1rm;
        }
      }
    }

    if (rollingBest === 0) continue; // no baseline

    const dropPercent = (rollingBest - currentBest) / rollingBest;
    if (dropPercent > threshold) {
      flags.push({
        type: 'e1rm_drop',
        lift: name,
        message: `${name} e1RM dropped ${(dropPercent * 100).toFixed(1)}% vs 28-day best`,
        details: {
          current: currentBest,
          baseline: rollingBest,
          dropPercent: Math.round(dropPercent * 1000) / 10,
        },
      });
    }
  }

  return flags;
}

/**
 * Check for RPE streak flag.
 *
 * Triggers when the top T1 set for a main lift has RPE >= 9.5
 * for N consecutive sessions.
 */
export function checkRPEStreak(
  sessions: Session[],
  streakThreshold: number = 2,
): FatigueFlag[] {
  const flags: FatigueFlag[] = [];

  // Group sessions by main lift
  const liftSessions: Record<string, Array<{ rpe: number; date: string }>> = {};

  // Sort sessions by date ascending
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const session of sorted) {
    for (const ex of session.exercises) {
      if (ex.tier !== 'T1') continue;
      if (!isMainLift(ex.name, ex.isMainLift)) continue;

      const name = normalizeExerciseName(ex.name);

      // Find top RPE set
      let topRPE = 0;
      for (const set of ex.sets) {
        if (set.rpe !== undefined && set.rpe > topRPE) {
          topRPE = set.rpe;
        }
      }

      if (topRPE > 0) {
        if (!liftSessions[name]) liftSessions[name] = [];
        liftSessions[name].push({ rpe: topRPE, date: session.date });
      }
    }
  }

  // Check streaks
  for (const [lift, entries] of Object.entries(liftSessions)) {
    let streak = 0;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].rpe >= 9.5) {
        streak++;
      } else {
        break;
      }
    }

    if (streak >= streakThreshold) {
      flags.push({
        type: 'rpe_streak',
        lift,
        message: `${lift}: RPE >= 9.5 for ${streak} consecutive sessions`,
        details: { streakCount: streak },
      });
    }
  }

  return flags;
}
