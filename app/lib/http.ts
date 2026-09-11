import { data } from "react-router";

export function notFound(): never {
  throw data(null, { status: 404 });
}

export function methodNotAllowed(): never {
  throw data(null, { status: 405 });
}

export function badRequest(): never {
  throw data(null, { status: 400 });
}
