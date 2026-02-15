import { describe, it, expect } from 'vitest';
import { computeE1RM, brzycki, epley, maxE1RMFromSets } from '../e1rm';

describe('brzycki', () => {
  it('returns weight for 1 rep', () => {
    expect(brzycki(100, 1)).toBeCloseTo(100, 1);
  });

  it('computes correctly for 5 reps', () => {
    // 100 * 36 / (37 - 5) = 3600 / 32 = 112.5
    expect(brzycki(100, 5)).toBeCloseTo(112.5, 1);
  });

  it('caps at reps = 37 to avoid division by zero', () => {
    // At reps = 37, denominator = 0, so we cap
    const result = brzycki(100, 37);
    expect(result).toBe(100 * 36); // 3600
  });
});

describe('epley', () => {
  it('returns weight for 1 rep', () => {
    // 100 * (1 + 1/30) = 103.33
    expect(epley(100, 1)).toBeCloseTo(103.33, 1);
  });

  it('computes correctly for 5 reps', () => {
    // 100 * (1 + 5/30) = 100 * 1.1667 = 116.67
    expect(epley(100, 5)).toBeCloseTo(116.67, 1);
  });
});

describe('computeE1RM', () => {
  describe('RPE-based (RTS)', () => {
    it('computes e1RM for 100kg x 5 @ RPE 8', () => {
      // RTS table: RPE 8, reps 5 → 81.1%
      // e1RM = 100 / 0.811 = 123.30
      const result = computeE1RM(100, 5, 8);
      expect(result.method).toBe('rts');
      expect(result.e1rm).toBeCloseTo(123.30, 0);
    });

    it('computes e1RM for 140kg x 1 @ RPE 10', () => {
      // RTS table: RPE 10, reps 1 → 100%
      // e1RM = 140 / 1.0 = 140
      const result = computeE1RM(140, 1, 10);
      expect(result.method).toBe('rts');
      expect(result.e1rm).toBe(140);
    });

    it('computes e1RM for 120kg x 3 @ RPE 9', () => {
      // RTS table: RPE 9, reps 3 → 89.2%
      // e1RM = 120 / 0.892 = 134.53
      const result = computeE1RM(120, 3, 9);
      expect(result.method).toBe('rts');
      expect(result.e1rm).toBeCloseTo(134.53, 0);
    });

    it('falls back to non-RPE for reps > 10 even with RPE', () => {
      const result = computeE1RM(60, 12, 7);
      expect(result.method).toBe('brzycki_epley_avg');
      expect(result.warning).toContain('Reps > 10');
    });

    it('falls back to non-RPE for RPE < 6', () => {
      const result = computeE1RM(100, 5, 5);
      expect(result.method).toBe('brzycki_epley_avg');
    });
  });

  describe('non-RPE (Brzycki/Epley average)', () => {
    it('returns identity for 1 rep without RPE', () => {
      const result = computeE1RM(150, 1);
      expect(result.method).toBe('identity');
      expect(result.e1rm).toBe(150);
    });

    it('averages Brzycki and Epley for multi-rep without RPE', () => {
      const result = computeE1RM(100, 5);
      const expectedBrzycki = 100 * 36 / (37 - 5); // 112.5
      const expectedEpley = 100 * (1 + 5 / 30);     // 116.67
      const expectedAvg = (expectedBrzycki + expectedEpley) / 2; // 114.58
      expect(result.method).toBe('brzycki_epley_avg');
      expect(result.e1rm).toBeCloseTo(expectedAvg, 0);
    });

    it('warns when reps > 10', () => {
      const result = computeE1RM(60, 15);
      expect(result.warning).toContain('Reps > 10');
    });
  });

  describe('edge cases', () => {
    it('returns 0 for zero weight', () => {
      const result = computeE1RM(0, 5, 8);
      expect(result.e1rm).toBe(0);
    });

    it('returns 0 for zero reps', () => {
      const result = computeE1RM(100, 0, 8);
      expect(result.e1rm).toBe(0);
    });
  });
});

describe('maxE1RMFromSets', () => {
  it('returns null for empty array', () => {
    expect(maxE1RMFromSets([])).toBeNull();
  });

  it('returns the highest e1RM among sets', () => {
    const sets = [
      { weight: 100, reps: 5, rpe: 8 },   // ~123.3
      { weight: 120, reps: 3, rpe: 9 },   // ~134.5
      { weight: 80, reps: 8 },             // ~100ish
    ];
    const result = maxE1RMFromSets(sets);
    expect(result).not.toBeNull();
    expect(result!.e1rm).toBeCloseTo(134.53, 0);
  });
});
