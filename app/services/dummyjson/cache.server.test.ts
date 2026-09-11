import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { cached, clearCache } from "./cache.server";

describe("cached", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearCache();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the cached value until the TTL expires", async () => {
    const load = vi.fn().mockResolvedValue("a");
    expect(await cached("k", 1000, load)).toBe("a");
    expect(await cached("k", 1000, load)).toBe("a");
    expect(load).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1001);
    await cached("k", 1000, load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("de-duplicates concurrent calls for the same key", async () => {
    let resolve!: (value: string) => void;
    const load = vi.fn(() => new Promise<string>((r) => (resolve = r)));
    const first = cached("k", 1000, load);
    const second = cached("k", 1000, load);
    expect(load).toHaveBeenCalledTimes(1);
    resolve("v");
    expect(await Promise.all([first, second])).toEqual(["v", "v"]);
  });

  it("does not cache failures", async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce("ok");
    await expect(cached("k", 1000, load)).rejects.toThrow("boom");
    expect(await cached("k", 1000, load)).toBe("ok");
    expect(load).toHaveBeenCalledTimes(2);
  });
});
