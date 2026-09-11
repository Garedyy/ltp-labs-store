const BASE_URL = process.env.DUMMYJSON_BASE_URL ?? "https://dummyjson.com";
const TIMEOUT_MS = 8_000;

export type Params = Record<string, string | number | undefined>;

// 404 is the only status callers distinguish; everything else (429, timeout, HTML body, bad
// shape) is a 502 rendered as "service unavailable".
export class ApiError extends Error {
  constructor(
    readonly status: 404 | 502,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function buildUrl(path: string, params: Params = {}): string {
  const url = new URL(path.replace(/\/+$/, ""), BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export async function fetchJson<T>(
  path: string,
  params: Params,
  parse: (value: unknown) => T | null,
): Promise<T> {
  const url = buildUrl(path, params);
  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
  } catch (error) {
    throw new ApiError(502, `Network failure for ${url}: ${String(error)}`);
  }

  if (response.status === 404) throw new ApiError(404, `Not found: ${url}`);
  if (!response.ok) throw new ApiError(502, `Upstream ${response.status} for ${url}`);

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(502, `Non-JSON body for ${url}`);
  }

  const parsed = parse(body);
  if (parsed === null) throw new ApiError(502, `Unexpected response shape for ${url}`);
  return parsed;
}
