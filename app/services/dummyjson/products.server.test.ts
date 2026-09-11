import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearCache } from "./cache.server";
import { ApiError, buildUrl, fetchJson } from "./client.server";
import { getCategories, getProduct, getProducts, searchProducts } from "./products.server";

const fetchMock = vi.fn<typeof fetch>();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const summary = { id: 1, title: "T", price: 1, category: "c", thumbnail: "", stock: 1 };

beforeEach(() => {
  clearCache();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildUrl", () => {
  it("maps params, skips undefined and never emits a trailing slash", () => {
    expect(buildUrl("/products/", { limit: 9, skip: 0, sortBy: undefined })).toBe(
      "https://dummyjson.com/products?limit=9&skip=0",
    );
    expect(buildUrl("/products/search", { q: "a b" })).toBe(
      "https://dummyjson.com/products/search?q=a+b",
    );
  });
});

describe("fetchJson", () => {
  it("throws ApiError(404) on 404 and ApiError(502) on 429, HTML bodies and bad shapes", async () => {
    fetchMock.mockResolvedValueOnce(json({ message: "nope" }, 404));
    await expect(fetchJson("/products/1", {}, () => null)).rejects.toMatchObject({ status: 404 });

    fetchMock.mockResolvedValueOnce(json({ message: "limit" }, 429));
    await expect(fetchJson("/products", {}, () => null)).rejects.toMatchObject({ status: 502 });

    fetchMock.mockResolvedValueOnce(new Response("<html>", { status: 200 }));
    await expect(fetchJson("/x", {}, () => null)).rejects.toMatchObject({ status: 502 });

    fetchMock.mockResolvedValueOnce(json({ unexpected: true }));
    await expect(fetchJson("/x", {}, () => null)).rejects.toMatchObject({ status: 502 });
  });

  it("maps a timeout or network error to ApiError(502)", async () => {
    fetchMock.mockRejectedValueOnce(new DOMException("timeout", "TimeoutError"));
    const error = await fetchJson("/x", {}, () => null).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(502);
  });
});

describe("product functions", () => {
  it("getProducts requests the summary fields with sort mapped to sortBy/order", async () => {
    fetchMock.mockResolvedValueOnce(json({ products: [summary], total: 1, skip: 0, limit: 1 }));
    const list = await getProducts({ limit: 9, skip: 9, sortBy: "price", order: "desc" });
    expect(list.total).toBe(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://dummyjson.com/products?limit=9&skip=9&select=id%2Ctitle%2Cprice%2Cthumbnail%2Cstock&sortBy=price&order=desc",
    );
  });

  it("searchProducts sends q first and caches per query", async () => {
    fetchMock.mockImplementation(async () => json({ products: [], total: 0, skip: 0, limit: 0 }));
    await searchProducts("phone", { limit: 9, skip: 0 });
    await searchProducts("phone", { limit: 9, skip: 0 });
    await searchProducts("laptop", { limit: 9, skip: 0 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "/products/search?q=phone&limit=9&skip=0",
    );
  });

  it("getProduct returns null on 404 and rethrows 502", async () => {
    fetchMock.mockResolvedValueOnce(json({ message: "nope" }, 404));
    expect(await getProduct(9999)).toBeNull();
    fetchMock.mockResolvedValueOnce(json({ message: "down" }, 503));
    await expect(getProduct(1)).rejects.toMatchObject({ status: 502 });
  });

  it("getCategories caches the list", async () => {
    fetchMock.mockImplementation(async () => json([{ slug: "beauty", name: "Beauty", url: "" }]));
    expect(await getCategories()).toHaveLength(1);
    await getCategories();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
