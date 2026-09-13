import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { ProductGrid } from "./product-grid";

const products = [
  {
    id: 1,
    title: "Essence Mascara",
    thumbnail: "https://cdn.example/1.webp",
    priceFormatted: "$9.99",
    inStock: true,
    href: "/en/products/1",
  },
];

describe("ProductGrid", () => {
  it("is named by the results heading by default", () => {
    renderWithProviders(
      <>
        <p id="results-heading">Showing 1-1 of 1</p>
        <ProductGrid products={products} />
      </>,
    );
    expect(screen.getByRole("list", { name: "Showing 1-1 of 1" })).toBeInTheDocument();
  });

  it("can be named by another heading, as on the home page", () => {
    renderWithProviders(
      <>
        <h1 id="trending-heading">Trending products</h1>
        <ProductGrid products={products} labelledBy="trending-heading" />
      </>,
    );
    expect(screen.getByRole("list", { name: "Trending products" })).toBeInTheDocument();
  });
});
