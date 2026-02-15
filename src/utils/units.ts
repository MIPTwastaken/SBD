const KG_TO_LB = 2.20462;

export function kgToLb(kg: number): number {
  return Math.round(kg * KG_TO_LB * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / KG_TO_LB) * 10) / 10;
}

export function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'lb') {
    return `${kgToLb(kg)} lb`;
  }
  return `${Math.round(kg * 10) / 10} kg`;
}

/**
 * Parse user-entered weight to kg.
 * If the user's preferred unit is lb, convert to kg for storage.
 */
export function parseWeightToKg(value: number, unit: 'kg' | 'lb'): number {
  if (unit === 'lb') return lbToKg(value);
  return value;
}

/**
 * Convert kg to display unit value (without string formatting).
 */
export function kgToDisplay(kg: number, unit: 'kg' | 'lb'): number {
  if (unit === 'lb') return kgToLb(kg);
  return Math.round(kg * 10) / 10;
}
