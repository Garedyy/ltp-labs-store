import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/locale-redirect.tsx"),
  ...prefix(":lang", [
    layout("routes/locale-layout.tsx", [
      route("set-language", "routes/set-language.tsx"),
      layout("routes/locale-errors.tsx", [
        index("routes/catalogue.tsx"),
        route("*", "routes/not-found.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
