import type { MiddlewareFunction } from "react-router";

// Pages depend on the cart cookie, so nothing is publicly cacheable.
export const responseHeadersMiddleware: MiddlewareFunction<Response> = async (_args, next) => {
  const response = await next();
  response.headers.set("Cache-Control", "private, no-cache");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
};
