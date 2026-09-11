export type Promo = { code: string; percentOff?: number; freeShipping?: boolean };

// Mocked promotions (plan decision 27).
const PROMO_CODES: Record<string, Promo> = {
  LTP10: { code: "LTP10", percentOff: 10 },
  FREESHIP: { code: "FREESHIP", freeShipping: true },
};

export function findPromo(input: unknown): Promo | null {
  if (typeof input !== "string") return null;
  const code = input.trim().toUpperCase();
  return PROMO_CODES[code] ?? null;
}
