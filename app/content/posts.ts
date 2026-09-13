// The blog's invented posts: text lives in the locales, dates are data and are formatted in
// the loader (Intl runs server-side only).
export const POSTS = [
  { key: "packaging", date: "2026-08-20" },
  { key: "laptops", date: "2026-07-08" },
  { key: "warehouse", date: "2026-06-15" },
] as const;

export type PostKey = (typeof POSTS)[number]["key"];

export type PostView = { key: PostKey; date: string; dateFormatted: string };
