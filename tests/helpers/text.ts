// Intl inserts non-breaking spaces (U+00A0, U+202F); tests compare against plain spaces.
export function normaliseSpaces(text: string): string {
  return text.replace(/[\u00a0\u202f]/g, " ");
}
