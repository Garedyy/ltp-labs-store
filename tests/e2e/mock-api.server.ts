import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Fixture-backed stand-in for DummyJSON (Docs/dummyjson-openapi.yaml). Mirrors the contract:
// echoed limit = items returned, q normalised, empty list for an unknown category, JSON
// { message } errors, HTML body for unknown paths. Fault injection: /products/999 -> 500,
// /products/998 -> 10 s delay, /products/categories?fail=1 -> 500, ?rateLimit=1 -> 429.

type Summary = Record<string, unknown> & { id: number; title: string; category: string };

const FIXTURES = resolve(process.cwd(), "tests/fixtures/dummyjson");
const PORT = Number(process.env.MOCK_API_PORT ?? 4010);

const all = JSON.parse(readFileSync(resolve(FIXTURES, "products-all.json"), "utf8")) as {
  products: Summary[];
};
const categories = JSON.parse(readFileSync(resolve(FIXTURES, "categories.json"), "utf8"));
const full = new Map<number, Record<string, unknown>>();
for (const file of readdirSync(FIXTURES)) {
  const match = /^product-(\d+)\.json$/.exec(file);
  if (match) full.set(Number(match[1]), JSON.parse(readFileSync(resolve(FIXTURES, file), "utf8")));
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function sendHtml(res: ServerResponse) {
  res.writeHead(404, { "content-type": "text/html" });
  res.end("<!doctype html><html><body><h1>Cannot GET</h1></body></html>");
}

function positiveInt(value: string | null, fallback: number): number | null {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return null;
  return Number(value);
}

function pick(product: Summary, select: string | null): Record<string, unknown> {
  if (!select) return product;
  const fields = new Set(["id", ...select.split(",")]);
  return Object.fromEntries(Object.entries(product).filter(([key]) => fields.has(key)));
}

function list(res: ServerResponse, url: URL, items: Summary[]) {
  const limit = positiveInt(url.searchParams.get("limit"), 30);
  const skip = positiveInt(url.searchParams.get("skip"), 0);
  const sortBy = url.searchParams.get("sortBy");
  const order = (url.searchParams.get("order") ?? "asc").toLowerCase();
  if (limit === null || skip === null)
    return send(res, 400, { message: "Invalid 'limit' or 'skip'" });
  if (sortBy && order !== "asc" && order !== "desc") {
    return send(res, 400, { message: "Order can be: 'asc' or 'desc'" });
  }
  let sorted = items;
  if (sortBy && items.some((item) => sortBy in item)) {
    sorted = [...items].sort((a, b) => {
      const [x, y] = [a[sortBy], b[sortBy]];
      const result =
        typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return order === "desc" ? -result : result;
    });
  }
  const page = sorted.slice(skip, limit === 0 ? undefined : skip + limit);
  const select = url.searchParams.get("select");
  send(res, 200, {
    products: page.map((item) => pick(item, select)),
    total: sorted.length,
    skip,
    limit: page.length,
  });
}

function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const path = url.pathname;

  if (url.searchParams.get("rateLimit") === "1") {
    return send(res, 429, { message: "request limit exceeded, please wait a bit" });
  }
  if (path.length > 1 && path.endsWith("/")) {
    res.writeHead(301, { location: path.slice(0, -1) + url.search });
    return res.end();
  }
  if (path === "/products/categories") {
    if (url.searchParams.get("fail") === "1") return send(res, 500, { message: "boom" });
    return send(res, 200, categories);
  }
  if (path === "/products/category-list") {
    return send(
      res,
      200,
      categories.map((c: { slug: string }) => c.slug),
    );
  }
  if (path === "/products/search") {
    const values = url.searchParams.getAll("q");
    if (values.length > 1) return send(res, 400, { message: "Repeated 'q' parameter" });
    const q = (values[0] ?? "").trim().toLowerCase().replace(/-/g, " ");
    const matches = q
      ? all.products.filter((p) => {
          const detail = full.get(p.id);
          const haystack = [p.title, p.category, detail?.description, detail?.brand]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
      : all.products;
    return list(res, url, matches);
  }
  if (path === "/products") return list(res, url, all.products);

  const category = /^\/products\/category\/([^/]+)$/.exec(path);
  if (category) {
    const slug = decodeURIComponent(category[1] ?? "").toLowerCase();
    return list(
      res,
      url,
      all.products.filter((p) => p.category === slug),
    );
  }

  const single = /^\/products\/(\d+)$/.exec(path);
  if (single) {
    const id = Number(single[1]);
    if (id === 999) return send(res, 500, { message: "injected failure" });
    if (id === 998) {
      setTimeout(() => send(res, 200, full.get(1)), 10_000);
      return;
    }
    const product = full.get(id);
    if (!product) return send(res, 404, { message: `Product with id '${id}' not found` });
    return send(res, 200, product);
  }

  return sendHtml(res);
}

createServer(handle).listen(PORT, () => {
  console.log(`Mock DummyJSON listening on http://localhost:${PORT}`);
});
