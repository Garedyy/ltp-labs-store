import { describe, expect, it } from "vitest";

import { LOCALES, type Locale, localeCodes } from "./config";
import resources from "~/locales";

type Leaf = { path: string; value: string };

function leaves(node: unknown, path = ""): Leaf[] {
  if (typeof node === "string") return [{ path, value: node }];
  if (node && typeof node === "object") {
    return Object.entries(node).flatMap(([key, child]) =>
      leaves(child, path ? `${path}.${key}` : key),
    );
  }
  throw new Error(`Unexpected value at ${path}`);
}

const byLocale = Object.fromEntries(
  localeCodes.map((locale) => [locale, leaves(resources[locale].translation)]),
) as Record<Locale, Leaf[]>;

const placeholders = (value: string) =>
  [...value.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort();

// ASCII, Latin-1 letters and the pt-PT quotation marks: everything a Portuguese keyboard types.
const KEYBOARD_SAFE = /^[\x20-\x7E\u00C0-\u00FF\u00AB\u00BB]*$/;

describe("locale resources", () => {
  it.each(localeCodes)("%s has no empty value and no value equal to its key", (locale) => {
    for (const { path, value } of byLocale[locale]) {
      expect(value.trim(), path).not.toBe("");
      expect(value, path).not.toBe(path);
    }
  });

  it.each(localeCodes)("%s uses keyboard-safe characters only", (locale) => {
    for (const { path, value } of byLocale[locale]) {
      expect(value, path).toMatch(KEYBOARD_SAFE);
    }
  });

  it.each(localeCodes.filter((l) => l !== "en"))(
    "%s uses the same placeholders as en",
    (locale) => {
      const english = new Map(byLocale.en.map((leaf) => [leaf.path, leaf.value]));
      for (const { path, value } of byLocale[locale]) {
        expect(placeholders(value), path).toEqual(placeholders(english.get(path) ?? ""));
      }
    },
  );

  it.each(localeCodes)("%s pluralises every key interpolating count", (locale) => {
    for (const { path, value } of byLocale[locale]) {
      if (!placeholders(value).includes("count")) continue;
      expect(path, `${path} interpolates count without a plural suffix`).toMatch(
        /_(zero|one|two|few|many|other)$/,
      );
    }
  });

  it.each(localeCodes)("%s declares every required plural suffix", (locale) => {
    const paths = new Set(byLocale[locale].map((leaf) => leaf.path));
    const bases = new Set(
      [...paths]
        .filter((p) => /_(zero|one|two|few|many|other)$/.test(p))
        .map((p) => p.replace(/_\w+$/, "")),
    );
    for (const base of bases) {
      for (const suffix of LOCALES[locale].plurals) {
        expect(paths.has(`${base}_${suffix}`), `${base}_${suffix}`).toBe(true);
      }
    }
  });
});
