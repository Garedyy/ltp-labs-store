import type en from "~/locales/en";
import cart from "./cart";
import catalogue from "./catalogue";
import common from "./common";
import errors from "./errors";
import pages from "./pages";
import product from "./product";

export default {
  common,
  catalogue,
  product,
  cart,
  pages,
  errors,
} satisfies typeof en;
