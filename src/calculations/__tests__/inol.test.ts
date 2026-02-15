import { describe, it, expect } from 'vitest';
import { computeINOL, exerciseINOL } from '../inol';

describe('computeINOL', () => {
  it('computes INOL for a normal set', () => {
    // 100kg, 5 reps, 1RM = 140kg
    // intensity = (100/140)*100 = 71.43%
    // INOL = 5 / (100 - 71.43) = 5 / 28.57 = 0.175
    const result = computeINOL(100, 5, 140);
    expect(result).not.toBeNull();
    expect(result!.inol).toBeCloseTo(0.175, 2);
  });

  it('returns null when anchor is missing', () => {
    expect(computeINOL(100, 5, null)).toBeNull();
    expect(computeINOL(100, 5, undefined)).toBeNull();
  });

  it('returns null when anchor is zero', () => {
    expect(computeINOL(100, 5, 0)).toBeNull();
  });

  it('caps denominator at 1 when intensity >= 100%', () => {
    // 150kg, 3 reps, 1RM = 140kg → intensity = 107.14%
    // denominator capped to 1 → INOL = 3/1 = 3
    const result = computeINOL(150, 3, 140);
    expect(result).not.toBeNull();
    expect(result!.inol).toBe(3);
    expect(result!.warning).toContain('Intensity >= 100%');
  });
});

describe('exerciseINOL', () => {
  it('sums INOL across sets', () => {
    const sets = [
      { weight: 100, reps: 5 },
      { weight: 100, reps: 5 },
      { weight: 100, reps: 5 },
    ];
    const result = exerciseINOL(sets, 140);
    expect(result).not.toBeNull();
    // Each set ≈ 0.175, sum ≈ 0.525
    expect(result!.inol).toBeCloseTo(0.525, 1);
  });

  it('returns null when no anchor', () => {
    expect(exerciseINOL([{ weight: 100, reps: 5 }], null)).toBeNull();
  });
});
