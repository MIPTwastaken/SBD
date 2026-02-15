import type { Sex } from '../schemas';

/**
 * Wilks coefficient calculation.
 *
 * Wilks = total * (500 / (a + b*x + c*x^2 + d*x^3 + e*x^4 + f*x^5))
 * where x = bodyweight in kg, total in kg
 *
 * Coefficients from the IPF Wilks formula (2020 revision not applied here;
 * using the classic/widely used coefficients).
 */
const WILKS_COEFFICIENTS = {
  male: {
    a: -216.0475144,
    b: 16.2606339,
    c: -0.002388645,
    d: -0.00113732,
    e: 7.01863e-6,
    f: -1.291e-8,
  },
  female: {
    a: 594.31747775582,
    b: -27.23842536447,
    c: 0.82112226871,
    d: -0.00930733913,
    e: 4.731582e-5,
    f: -9.054e-8,
  },
};

export function wilks(totalKg: number, bodyweightKg: number, sex: Sex): number {
  if (totalKg <= 0 || bodyweightKg <= 0) return 0;

  const c = WILKS_COEFFICIENTS[sex];
  const x = bodyweightKg;
  const denominator =
    c.a +
    c.b * x +
    c.c * x ** 2 +
    c.d * x ** 3 +
    c.e * x ** 4 +
    c.f * x ** 5;

  if (denominator <= 0) return 0;

  return Math.round((totalKg * (500 / denominator)) * 100) / 100;
}

/**
 * DOTS coefficient calculation.
 *
 * DOTS = total * (500 / (a*bw^4 + b*bw^3 + c*bw^2 + d*bw + e))
 *
 * Coefficients from the DOTS formula specification.
 */
const DOTS_COEFFICIENTS = {
  male: {
    a: -0.000001093,
    b: 0.0007391293,
    c: -0.1918759221,
    d: 24.0900756,
    e: -307.75076,
  },
  female: {
    a: -0.0000010706,
    b: 0.0005158568,
    c: -0.1126655495,
    d: 13.6175032,
    e: -57.96288,
  },
};

export function dots(totalKg: number, bodyweightKg: number, sex: Sex): number {
  if (totalKg <= 0 || bodyweightKg <= 0) return 0;

  const c = DOTS_COEFFICIENTS[sex];
  const bw = bodyweightKg;
  const denominator =
    c.a * bw ** 4 +
    c.b * bw ** 3 +
    c.c * bw ** 2 +
    c.d * bw +
    c.e;

  if (denominator <= 0) return 0;

  return Math.round((totalKg * (500 / denominator)) * 100) / 100;
}
