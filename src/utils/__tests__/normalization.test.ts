import { describe, it, expect } from 'vitest';
import { normalizeExerciseName, isMainLift, getCanonicalLiftName } from '../normalization';

describe('normalizeExerciseName', () => {
  it('lowercases and trims', () => {
    expect(normalizeExerciseName('  Squat  ')).toBe('squat');
  });

  it('collapses whitespace', () => {
    expect(normalizeExerciseName('Bench  Press')).toBe('bench press');
  });
});

describe('isMainLift', () => {
  it('detects squat', () => {
    expect(isMainLift('Squat')).toBe(true);
    expect(isMainLift('Low Bar Squat')).toBe(true);
  });

  it('detects bench', () => {
    expect(isMainLift('Bench Press')).toBe(true);
    expect(isMainLift('Close Grip Bench')).toBe(true);
  });

  it('detects deadlift', () => {
    expect(isMainLift('Deadlift')).toBe(true);
    expect(isMainLift('Sumo Deadlift')).toBe(true);
  });

  it('detects overhead press', () => {
    expect(isMainLift('Overhead Press')).toBe(true);
    expect(isMainLift('OHP')).toBe(true);
  });

  it('returns false for non-main lifts', () => {
    expect(isMainLift('Barbell Row')).toBe(false);
    expect(isMainLift('Leg Press')).toBe(false);
  });

  it('respects manual override', () => {
    expect(isMainLift('Custom Lift', true)).toBe(true);
    expect(isMainLift('Squat', false)).toBe(false);
  });
});

describe('getCanonicalLiftName', () => {
  it('returns canonical name for main lifts', () => {
    expect(getCanonicalLiftName('Back Squat')).toBe('squat');
    expect(getCanonicalLiftName('Bench Press')).toBe('bench');
    expect(getCanonicalLiftName('Conventional Deadlift')).toBe('deadlift');
    expect(getCanonicalLiftName('OHP')).toBe('overhead press');
  });

  it('returns null for non-main lifts', () => {
    expect(getCanonicalLiftName('Lat Pulldown')).toBeNull();
  });
});
