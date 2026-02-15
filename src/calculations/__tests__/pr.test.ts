import { describe, it, expect } from 'vitest';
import { detectPRs } from '../pr';
import type { Exercise, PRRecord } from '../../schemas';

function makeExercise(
  name: string,
  sets: Array<{ weight: number; reps: number; rpe?: number }>,
): Exercise {
  return {
    id: 'ex1',
    name,
    tier: 'T1',
    sets: sets.map((s, i) => ({ id: `s${i}`, ...s })),
  };
}

describe('detectPRs', () => {
  it('detects e1RM PR on first-ever entry', () => {
    const exercises = [makeExercise('Squat', [{ weight: 100, reps: 5, rpe: 8 }])];
    const prs = detectPRs(exercises, []);

    const e1rmPR = prs.find(p => p.type === 'e1rm');
    expect(e1rmPR).toBeDefined();
    expect(e1rmPR!.value).toBeGreaterThan(100);
    expect(e1rmPR!.previousValue).toBeUndefined();
  });

  it('detects e1RM PR when beating existing record', () => {
    const existingPRs: PRRecord[] = [
      {
        id: 'pr1',
        exerciseName: 'squat',
        type: 'e1rm',
        value: 120,
        sessionId: 's0',
        sessionDate: '2024-12-01',
      },
    ];
    const exercises = [makeExercise('Squat', [{ weight: 120, reps: 3, rpe: 9 }])];
    const prs = detectPRs(exercises, existingPRs);

    const e1rmPR = prs.find(p => p.type === 'e1rm');
    expect(e1rmPR).toBeDefined();
    expect(e1rmPR!.value).toBeGreaterThan(120);
    expect(e1rmPR!.previousValue).toBe(120);
  });

  it('does not detect e1RM PR when below existing record', () => {
    const existingPRs: PRRecord[] = [
      {
        id: 'pr1',
        exerciseName: 'squat',
        type: 'e1rm',
        value: 200,
        sessionId: 's0',
        sessionDate: '2024-12-01',
      },
    ];
    const exercises = [makeExercise('Squat', [{ weight: 100, reps: 5, rpe: 8 }])];
    const prs = detectPRs(exercises, existingPRs);

    const e1rmPR = prs.find(p => p.type === 'e1rm');
    expect(e1rmPR).toBeUndefined();
  });

  it('detects weight_at_reps PR', () => {
    const exercises = [makeExercise('Bench', [{ weight: 100, reps: 5 }])];
    const prs = detectPRs(exercises, []);

    const repPR = prs.find(p => p.type === 'weight_at_reps' && p.reps === 5);
    expect(repPR).toBeDefined();
    expect(repPR!.value).toBe(100);
  });

  it('handles case-insensitive exercise names', () => {
    const existingPRs: PRRecord[] = [
      {
        id: 'pr1',
        exerciseName: 'squat',
        type: 'e1rm',
        value: 100,
        sessionId: 's0',
        sessionDate: '2024-12-01',
      },
    ];
    const exercises = [makeExercise('SQUAT', [{ weight: 110, reps: 1 }])];
    const prs = detectPRs(exercises, existingPRs);

    const e1rmPR = prs.find(p => p.type === 'e1rm');
    expect(e1rmPR).toBeDefined();
    expect(e1rmPR!.value).toBe(110);
  });
});
