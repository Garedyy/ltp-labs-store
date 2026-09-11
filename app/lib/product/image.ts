// ?image is 1-based and omitted for the first image; anything invalid falls back to 1.
export function clampImageIndex(value: string | null, total: number): number {
  const index = Number(value);
  if (!Number.isInteger(index) || index < 1 || index > total) return 1;
  return index;
}
