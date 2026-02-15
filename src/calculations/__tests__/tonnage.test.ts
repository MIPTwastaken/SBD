import { describe, it, expect } from 'vitest';
import { setTonnage, exerciseTonnage, sessionTonnage, tonnageByTier } from '../tonnage';
import type { Session, Exercise, TrainingSet } from '../../schemas';

function makeSet(weight: number, reps: number): TrainingSet {
  return { id: '1', weight, reps };
}

function makeExercise(sets: TrainingSet[], tier: 'T1' | 'T2' | 'T3' = 'T1'): Exercise {
  return { id: '1', name: 'Squat', tier, sets };
}

describe('setTonnage', () => {
  it('computes weight * reps', () => {
    expect(setTonnage(makeSet(100, 5))).toBe(500);
  });

  it('handles single rep', () => {
    expect(setTonnage(makeSet(140, 1))).toBe(140);
  });
});

describe('exerciseTonnage', () => {
  it('sums all set tonnages', () => {
    const ex = makeExercise([makeSet(100, 5), makeSet(100, 5), makeSet(100, 5)]);
    expect(exerciseTonnage(ex)).toBe(1500);
  });
});

describe('sessionTonnage', () => {
  it('sums all exercise tonnages', () => {
    const session: Session = {
      id: '1',
      date: '2025-01-01T00:00:00Z',
      exercises: [
        makeExercise([makeSet(100, 5)]),  // 500
        makeExercise([makeSet(60, 10)]),   // 600
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };
    expect(sessionTonnage(session)).toBe(1100);
  });
});

describe('tonnageByTier', () => {
  it('breaks down tonnage by tier', () => {
    const session: Session = {
      id: '1',
      date: '2025-01-01T00:00:00Z',
      exercises: [
        makeExercise([makeSet(100, 5)], 'T1'),   // 500
        makeExercise([makeSet(80, 8)], 'T2'),     // 640
        makeExercise([makeSet(40, 12)], 'T3'),    // 480
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };
    const result = tonnageByTier(session);
    expect(result.T1).toBe(500);
    expect(result.T2).toBe(640);
    expect(result.T3).toBe(480);
  });
});
