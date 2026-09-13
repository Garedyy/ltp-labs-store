import { describe, expect, it } from "vitest";

import { readTheme, serializeTheme, themeCookie } from "./theme-cookie.server";

function requestWithCookie(cookie: string): Request {
  return new Request("http://localhost/en", { headers: { Cookie: cookie } });
}

describe("theme cookie", () => {
  it("reads an explicit choice and falls back to system", async () => {
    expect(await readTheme(requestWithCookie(await themeCookie.serialize("dark")))).toBe("dark");
    expect(await readTheme(requestWithCookie(await themeCookie.serialize("light")))).toBe("light");
    expect(await readTheme(requestWithCookie(await themeCookie.serialize("system")))).toBe(
      "system",
    );
    expect(await readTheme(requestWithCookie("theme=purple"))).toBe("system");
    expect(await readTheme(new Request("http://localhost/en"))).toBe("system");
  });

  it("stores light and dark for a year, httpOnly and lax", async () => {
    const header = await serializeTheme("dark");
    expect(header).toMatch(/^theme=/);
    expect(header).toContain("Max-Age=31536000");
    expect(header).toContain("HttpOnly");
    expect(header).toContain("SameSite=Lax");
  });

  it("removes the cookie when system is chosen", async () => {
    expect(await serializeTheme("system")).toContain("Max-Age=0");
  });
});
