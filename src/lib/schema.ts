/**
 * Database Schema Helpers & Conversions
 *
 * Unit Storage Strategy:
 * - Weight: stored in GRAMS (g) as the base unit internally
 * - Volume: stored in MILLILITERS (mL) as the base unit internally
 * - Count: stored as ITEMS (no conversion needed)
 *
 * Price Storage:
 * - All prices stored in PAISE (1 INR = 100 paise) as integer to avoid floating-point errors
 * - base_price_paise: price per base unit (per gram, per mL, or per item)
 * - Display layer converts paise → INR for UI
 *
 * Numeric Types:
 * - NUMERIC(20,6): quantities (supports up to 14 digits before decimal, 6 after)
 * - BIGINT: prices in paise (avoids floating point; supports values up to ~92 quadrillion paise)
 * - TEXT for UUIDs (simpler than uuid type for Neon serverless driver)
 */

export const UNIT_DIMENSIONS = {
  weight: ["g", "kg"] as const,
  volume: ["mL", "L"] as const,
  count: ["item"] as const,
} as const;

export type UnitDimension = keyof typeof UNIT_DIMENSIONS;
export type Unit = "g" | "kg" | "mL" | "L" | "item";

/** Conversion factors to base unit (gram for weight, mL for volume, item for count) */
export const UNIT_TO_BASE: Record<Unit, number> = {
  g: 1,
  kg: 1000,
  mL: 1,
  L: 1000,
  item: 1,
};

export function unitDimension(unit: Unit): UnitDimension {
  if (unit === "g" || unit === "kg") return "weight";
  if (unit === "mL" || unit === "L") return "volume";
  return "count";
}

/** Convert quantity from any unit to base unit */
export function toBaseUnit(quantity: number, unit: Unit): number {
  return quantity * UNIT_TO_BASE[unit];
}

/** Convert quantity from base unit to display unit */
export function fromBaseUnit(baseQuantity: number, unit: Unit): number {
  return baseQuantity / UNIT_TO_BASE[unit];
}

/** Convert paise to INR string */
export function paiseToINR(paise: number): string {
  return (paise / 100).toFixed(2);
}

/** Convert INR to paise (integer) */
export function inrToPaise(inr: number): number {
  return Math.round(inr * 100);
}

/**
 * Calculate order total in paise.
 * base_price_paise is price per base unit.
 * We convert ordered quantity to base units, then multiply.
 */
export function calculateOrderTotal(
  quantityOrdered: number,
  orderUnit: Unit,
  basePricePaise: number
): number {
  const baseQty = toBaseUnit(quantityOrdered, orderUnit);
  return Math.round(baseQty * basePricePaise);
}

export const UNITS_FOR_DIMENSION: Record<UnitDimension, Unit[]> = {
  weight: ["g", "kg"],
  volume: ["mL", "L"],
  count: ["item"],
};
