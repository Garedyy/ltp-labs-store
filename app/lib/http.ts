import { data } from "react-router";

import { ApiError } from "~/services/dummyjson/client.server";

export function notFound(): never {
  throw data(null, { status: 404 });
}

export function methodNotAllowed(): never {
  throw data(null, { status: 405 });
}

export function badRequest(): never {
  throw data(null, { status: 400 });
}

export function serviceUnavailable(): never {
  throw data(null, { status: 502 });
}

// ApiError is server-only; loaders convert it so the boundary renders 404 or 502.
export function toRouteError(error: unknown): unknown {
  if (error instanceof ApiError) return data(null, { status: error.status });
  return error;
}
