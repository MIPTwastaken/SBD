import { describe, it, expect } from 'vitest';
import { checkE1RMDrop, checkRPEStreak } from '../fatigue';
import type { Session } from '../../schemas';

function makeSession(
  id: string,
  date: string,
  exercises: Array<{
    name: string;
    tier: 'T1' | 'T2' | 'T3';
    sets: Array<{ weight: number; reps: number; rpe?: number }>;
  }>,
): Session {
  return {
    id,
    date,
    exercises: exercises.map((ex, i) => ({
      id: `ex${i}`,
      name: ex.name,
      tier: ex.tier,
      sets: ex.sets.map((s, j) => ({ id: `s${j}`, ...s })),
    })),
    createdAt: date,
    updatedAt: date,
  };
}

describe('checkE1RMDrop', () => {
  it('flags e1RM drop > 5%', () => {
    const sessions = [
      // Prior session: 140kg x 1 @ 10 = 140 e1RM
      makeSession('s1', '2025-01-01T00:00:00Z', [
        { name: 'Squat', tier: 'T1', sets: [{ weight: 140, reps: 1, rpe: 10 }] },
      ]),
      // Current session: significantly lower
      makeSession('s2', '2025-01-15T00:00:00Z', [
        { name: 'Squat', tier: 'T1', sets: [{ weight: 120, reps: 1, rpe: 10 }] },
      ]),
    ];

    const current = sessions[1];
    const flags = checkE1RMDrop(current, sessions, 0.05);
    expect(flags.length).toBe(1);
    expect(flags[0].type).toBe('e1rm_drop');
    expect(flags[0].lift).toBe('squat');
  });

  it('does not flag when drop < threshold', () => {
    const sessions = [
      makeSession('s1', '2025-01-01T00:00:00Z', [
        { name: 'Squat', tier: 'T1', sets: [{ weight: 140, reps: 1, rpe: 10 }] },
      ]),
      // 137.2 / 140 ≈ 98% → drop ≈ 2% < 5%
      makeSession('s2', '2025-01-15T00:00:00Z', [
        { name: 'Squat', tier: 'T1', sets: [{ weight: 137, reps: 1, rpe: 10 }] },
      ]),
    ];

    const current = sessions[1];
    const flags = checkE1RMDrop(current, sessions, 0.05);
    expect(flags.length).toBe(0);
  });

  it('returns no flags when no prior data', () => {
    const current = makeSession('s1', '2025-01-15T00:00:00Z', [
      { name: 'Squat', tier: 'T1', sets: [{ weight: 100, reps: 5, rpe: 8 }] },
    ]);
    const flags = checkE1RMDrop(current, [current], 0.05);
    expect(flags.length).toBe(0);
  });

  it('ignores non-T1 exercises', () => {
    const sessions = [
      makeSession('s1', '2025-01-01T00:00:00Z', [
        { name: 'Squat', tier: 'T2', sets: [{ weight: 140, reps: 1, rpe: 10 }] },
      ]),
      makeSession('s2', '2025-01-15T00:00:00Z', [
        { name: 'Squat', tier: 'T2', sets: [{ weight: 100, reps: 1, rpe: 10 }] },
      ]),
    ];

    const current = sessions[1];
    const flags = checkE1RMDrop(current, sessions, 0.05);
    expect(flags.length).toBe(0);
  });
});

describe('checkRPEStreak', () => {
  it('flags RPE >= 9.5 for N consecutive sessions', () => {
    const sessions = [
      makeSession('s1', '2025-01-01T00:00:00Z', [
        { name: 'Squat', tier: 'T1', sets: [{ weight: 140, reps: 1, rpe: 10 }] },
      ]),
      makeSession('s2', '2025-01-08T00:00:00Z', [
        { name: 'Squat', tier: 'T1', sets: [{ weight: 140, reps: 1, rpe: 9.5 }] },
      ]),
    ];

    const flags = checkRPEStreak(sessions, 2);
    expect(flags.length).toBe(1);
    expect(flags[0].type).toBe('rpe_streak');
    expect(flags[0].details.streakCount).toBe(2);
  });

  it('does not flag when streak is broken', () => {
    const sessions = [
      makeSession('s1', '2025-01-01T00:00:00Z', [
        { name: 'Squat', tier: 'T1', sets: [{ weight: 140, reps: 1, rpe: 10 }] },
      ]),
      makeSession('s2', '2025-01-08T00:00:00Z', [
        { name: 'Squat', tier: 'T1', sets: [{ weight: 140, reps: 3, rpe: 8 }] },
      ]),
      makeSession('s3', '2025-01-15T00:00:00Z', [
        { name: 'Squat', tier: 'T1', sets: [{ weight: 140, reps: 1, rpe: 10 }] },
      ]),
    ];

    const flags = checkRPEStreak(sessions, 2);
    expect(flags.length).toBe(0);
  });

  it('returns no flags with fewer sessions than threshold', () => {
    const sessions = [
      makeSession('s1', '2025-01-01T00:00:00Z', [
        { name: 'Squat', tier: 'T1', sets: [{ weight: 140, reps: 1, rpe: 10 }] },
      ]),
    ];

    const flags = checkRPEStreak(sessions, 2);
    expect(flags.length).toBe(0);
  });
});
