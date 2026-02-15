import { describe, it, expect } from 'vitest';
import { wilks, dots } from '../competition';

describe('wilks', () => {
  it('computes a reasonable Wilks for a male lifter', () => {
    // ~83kg lifter, ~600kg total → roughly 400+ Wilks
    const result = wilks(600, 83, 'male');
    expect(result).toBeGreaterThan(350);
    expect(result).toBeLessThan(500);
  });

  it('computes a reasonable Wilks for a female lifter', () => {
    const result = wilks(400, 63, 'female');
    expect(result).toBeGreaterThan(300);
    expect(result).toBeLessThan(600);
  });

  it('returns 0 for zero total', () => {
    expect(wilks(0, 83, 'male')).toBe(0);
  });

  it('returns 0 for zero bodyweight', () => {
    expect(wilks(600, 0, 'male')).toBe(0);
  });
});

describe('dots', () => {
  it('computes a reasonable DOTS for a male lifter', () => {
    const result = dots(600, 83, 'male');
    expect(result).toBeGreaterThan(300);
    expect(result).toBeLessThan(500);
  });

  it('computes a reasonable DOTS for a female lifter', () => {
    const result = dots(400, 63, 'female');
    expect(result).toBeGreaterThan(300);
    expect(result).toBeLessThan(600);
  });

  it('returns 0 for zero total', () => {
    expect(dots(0, 83, 'male')).toBe(0);
  });

  it('returns 0 for zero bodyweight', () => {
    expect(dots(600, 0, 'male')).toBe(0);
  });
});
