import { describe, expect, it } from "vitest";

import { detectLocale, localeFromAcceptLanguage } from "./detect-locale.server";
import { localeCookie } from "./locale-cookie.server";

describe("localeFromAcceptLanguage", () => {
  it("returns null without a header or without a supported language", () => {
    expect(localeFromAcceptLanguage(null)).toBeNull();
    expect(localeFromAcceptLanguage("fr-FR,fr;q=0.9")).toBeNull();
  });

  it("matches on the primary subtag and honours quality weights", () => {
    expect(localeFromAcceptLanguage("pt-BR")).toBe("pt");
    expect(localeFromAcceptLanguage("fr;q=0.9, pt;q=0.8, en;q=0.7")).toBe("pt");
    expect(localeFromAcceptLanguage("pt;q=0.5, en;q=0.9")).toBe("en");
    expect(localeFromAcceptLanguage("pt;q=0")).toBeNull();
  });
});

describe("detectLocale", () => {
  it("prefers the cookie, then Accept-Language, then the default", async () => {
    const cookie = await localeCookie.serialize("pt");
    const withCookie = new Request("http://localhost/", {
      headers: { Cookie: cookie, "Accept-Language": "en" },
    });
    expect(await detectLocale(withCookie)).toBe("pt");

    const withHeader = new Request("http://localhost/", {
      headers: { "Accept-Language": "pt-PT" },
    });
    expect(await detectLocale(withHeader)).toBe("pt");

    expect(await detectLocale(new Request("http://localhost/"))).toBe("en");
  });

  it("ignores an invalid cookie value", async () => {
    const cookie = await localeCookie.serialize("xx");
    const request = new Request("http://localhost/", { headers: { Cookie: cookie } });
    expect(await detectLocale(request)).toBe("en");
  });
});
