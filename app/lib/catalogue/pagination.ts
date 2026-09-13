export const PAGE_SIZE = 9;

export function skipFor(page: number): number {
  return (page - 1) * PAGE_SIZE;
}

// The API echoes the number of items returned as "limit": never derive pages from it.
export function pageCountFor(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function showing(total: number, skip: number, count: number): { from: number; to: number } {
  return { from: total > 0 ? skip + 1 : 0, to: skip + count };
}

// A window of `size` page numbers centred on `page`, clamped to the range.
export function pageWindow(page: number, pageCount: number, size = 5): number[] {
  const start = Math.min(Math.max(page - 2, 1), Math.max(1, pageCount - size + 1));
  const end = Math.min(start + size - 1, pageCount);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
