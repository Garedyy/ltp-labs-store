import { data, redirect } from "react-router";

import { ApiError } from "~/services/dummyjson/client.server";
import type { ErrorCode } from "./error-codes";

export function notFound(code: ErrorCode = "page-not-found"): never {
  throw data({ code }, { status: 404 });
}

export function methodNotAllowed(): never {
  throw data(null, { status: 405 });
}

export function badRequest(): never {
  throw data(null, { status: 400 });
}

export function serviceUnavailable(): never {
  throw data({ code: "service-unavailable" satisfies ErrorCode }, { status: 502 });
}

// ApiError is server-only; loaders convert it so the boundary renders 404 or 502.
export function toRouteError(error: unknown): unknown {
  if (error instanceof ApiError) {
    const code: ErrorCode = error.status === 404 ? "page-not-found" : "service-unavailable";
    return data({ code }, { status: error.status });
  }
  return error;
}

// Post/Redirect/Get for submissions made without JavaScript: back to the same page (303).
export function redirectBack(request: Request, url: URL, headers: HeadersInit): Response {
  const referer = request.headers.get("Referer");
  const target =
    referer && new URL(referer).origin === url.origin ? referer : url.pathname + url.search;
  return redirect(target, { status: 303, headers });
}
