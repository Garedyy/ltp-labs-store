import { describe, expect, it } from "vitest";

import { sanitiseLines } from "./cart";
import { cartStorage } from "./session.server";

describe("cart session cookie", () => {
  it("keeps a 50-line cart under 4000 bytes", async () => {
    const session = await cartStorage.getSession();
    session.set(
      "cart",
      Array.from({ length: 50 }, (_, i) => ({ productId: 190 + i, quantity: 99 })),
    );
    session.set("promoCode", "FREESHIP");
    const cookie = await cartStorage.commitSession(session);
    expect(cookie.length).toBeLessThan(4000);
  });

  it("reads a tampered cookie as an empty cart", async () => {
    const session = await cartStorage.getSession();
    session.set("cart", [{ productId: 1, quantity: 1 }]);
    const cookie = await cartStorage.commitSession(session);
    const tampered = cookie.replace(/__cart=([^;]{10})/, "__cart=XXXXXXXXXX");
    const read = await cartStorage.getSession(tampered);
    expect(sanitiseLines(read.get("cart"))).toEqual([]);
  });
});
