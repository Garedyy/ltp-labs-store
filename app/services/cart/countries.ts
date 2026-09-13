// Shipping countries offered by the demo payment page; the first one is the default.
export const COUNTRIES = ["pt", "es", "fr", "de", "other"] as const;

export type Country = (typeof COUNTRIES)[number];

export function parseCountry(value: unknown): Country {
  return (COUNTRIES as readonly unknown[]).includes(value) ? (value as Country) : COUNTRIES[0];
}
