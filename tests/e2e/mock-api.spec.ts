import { expect, test } from "@playwright/test";

// Guards the fixture-backed stand-in against the behaviours of Docs/dummyjson-openapi.yaml.
const api = "http://localhost:4010";

test.describe("mock API contract", () => {
  test.beforeEach(({ browserName: _browserName }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "one project is enough");
  });

  test("lists, pages and echoes the number of items returned as limit", async ({ request }) => {
    const first = await (await request.get(`${api}/products?limit=9&skip=0`)).json();
    expect(first.total).toBe(194);
    expect(first.products).toHaveLength(9);
    expect(first.limit).toBe(9);
    const last = await (await request.get(`${api}/products?limit=9&skip=189`)).json();
    expect(last.products).toHaveLength(5);
    expect(last.limit).toBe(5);
    const beyond = await (await request.get(`${api}/products?limit=9&skip=500`)).json();
    expect(beyond.products).toEqual([]);
  });

  test("sorts, selects and validates parameters", async ({ request }) => {
    const sorted = await (
      await request.get(`${api}/products?limit=2&sortBy=price&order=desc&select=title,price`)
    ).json();
    expect(sorted.products[0].price).toBe(36999.99);
    expect(Object.keys(sorted.products[0]).sort()).toEqual(["id", "price", "title"]);
    expect((await request.get(`${api}/products?limit=x`)).status()).toBe(400);
    expect((await request.get(`${api}/products?sortBy=price&order=up`)).status()).toBe(400);
  });

  test("categories, category listing and unknown slugs", async ({ request }) => {
    const categories = await (await request.get(`${api}/products/categories`)).json();
    expect(categories).toHaveLength(24);
    const beauty = await (await request.get(`${api}/products/category/BEAUTY?limit=0`)).json();
    expect(beauty.total).toBe(5);
    const unknown = await (await request.get(`${api}/products/category/nope`)).json();
    expect(unknown).toEqual({ products: [], total: 0, skip: 0, limit: 0 });
  });

  test("search normalises q and rejects a repeated q", async ({ request }) => {
    const phone = await (await request.get(`${api}/products/search?q=Phone&limit=0`)).json();
    expect(phone.total).toBeGreaterThan(9);
    const all = await (await request.get(`${api}/products/search?limit=0`)).json();
    expect(all.total).toBe(194);
    expect((await request.get(`${api}/products/search?q=a&q=b`)).status()).toBe(400);
  });

  test("serves the ten full fixtures, including the four out-of-stock products", async ({
    request,
  }) => {
    for (const id of [1, 2, 3, 6, 16, 78, 117, 132, 153, 193]) {
      const product = await (await request.get(`${api}/products/${id}`)).json();
      expect(product.id).toBe(id);
    }
    const out = await (await request.get(`${api}/products/117`)).json();
    expect(out.stock).toBe(0);
    const missing = await request.get(`${api}/products/9999`);
    expect(missing.status()).toBe(404);
    expect(await missing.json()).toEqual({ message: "Product with id '9999' not found" });
  });

  test("injects faults: 500, 429, HTML 404 and a permanent redirect", async ({ request }) => {
    expect((await request.get(`${api}/products/999`)).status()).toBe(500);
    expect((await request.get(`${api}/products/categories?fail=1`)).status()).toBe(500);
    expect((await request.get(`${api}/products?rateLimit=1`)).status()).toBe(429);
    const html = await request.get(`${api}/nope`);
    expect(html.status()).toBe(404);
    expect(html.headers()["content-type"]).toContain("text/html");
    const slash = await request.get(`${api}/products/`, { maxRedirects: 0 });
    expect(slash.status()).toBe(301);
  });
});
