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

export type PageItem = number | "gap-start" | "gap-end";

// The window plus the first and last pages, with a gap marker only where pages are hidden:
// page 4 of 22 gives 1 2 3 4 5 6 … 22, page 9 gives 1 … 7 8 9 10 11 … 22.
export function pageItems(page: number, pageCount: number): PageItem[] {
  const window = pageWindow(page, pageCount);
  const first = window[0] ?? 1;
  const last = window[window.length - 1] ?? pageCount;
  const before: PageItem[] = first === 1 ? [] : first === 2 ? [1] : [1, "gap-start"];
  const after: PageItem[] =
    last === pageCount ? [] : last === pageCount - 1 ? [pageCount] : ["gap-end", pageCount];
  return [...before, ...window, ...after];
}
