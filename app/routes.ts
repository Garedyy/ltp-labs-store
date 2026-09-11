import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
  index("routes/locale-redirect.tsx"),
  ...prefix(":lang", [
    layout("routes/locale-layout.tsx", [
      route("set-language", "routes/set-language.tsx"),
      layout("routes/locale-errors.tsx", [
        index("routes/catalogue.tsx"),
        route("search", "routes/search.tsx"),
        route("products/:productId", "routes/product.tsx"),
        route("cart", "routes/cart.tsx"),
        route("about", "routes/about.tsx"),
        route("contact", "routes/contact.tsx"),
        route("blog", "routes/blog.tsx"),
        route("account", "routes/account.tsx"),
        route("*", "routes/not-found.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
