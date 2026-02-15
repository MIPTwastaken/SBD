import { describe, it, expect } from 'vitest';
import { kgToLb, lbToKg, formatWeight, parseWeightToKg, kgToDisplay } from '../units';

describe('kgToLb', () => {
  it('converts kg to lb', () => {
    expect(kgToLb(100)).toBeCloseTo(220.5, 0);
  });
});

describe('lbToKg', () => {
  it('converts lb to kg', () => {
    expect(lbToKg(220)).toBeCloseTo(99.8, 0);
  });
});

describe('round-trip conversion', () => {
  it('kg → lb → kg preserves value within rounding', () => {
    const original = 100;
    const roundTrip = lbToKg(kgToLb(original));
    expect(roundTrip).toBeCloseTo(original, 0);
  });
});

describe('formatWeight', () => {
  it('formats kg', () => {
    expect(formatWeight(100, 'kg')).toBe('100 kg');
  });

  it('formats lb', () => {
    expect(formatWeight(100, 'lb')).toBe('220.5 lb');
  });
});

describe('parseWeightToKg', () => {
  it('returns kg as-is', () => {
    expect(parseWeightToKg(100, 'kg')).toBe(100);
  });

  it('converts lb to kg', () => {
    expect(parseWeightToKg(220, 'lb')).toBeCloseTo(99.8, 0);
  });
});

describe('kgToDisplay', () => {
  it('returns kg value directly', () => {
    expect(kgToDisplay(100, 'kg')).toBe(100);
  });

  it('converts to lb', () => {
    expect(kgToDisplay(100, 'lb')).toBeCloseTo(220.5, 0);
  });
});
