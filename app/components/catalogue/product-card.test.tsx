import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { ProductCard } from "./product-card";

const product = {
  id: 1,
  title: "Essence Mascara",
  thumbnail: "https://cdn.example/1.webp",
  priceFormatted: "$9.99",
  inStock: false,
  href: "/en/products/1",
};

describe("ProductCard", () => {
  it("links the title, hides the image from AT, names the price and flags out of stock", () => {
    renderWithProviders(
      <ul>
        <ProductCard product={product} priority="high" />
      </ul>,
    );
    const link = screen.getByRole("link", { name: "Essence Mascara" });
    expect(link).toHaveAttribute("href", "/en/products/1");
    expect(screen.getByRole("heading", { level: 2 })).toContainElement(link);
    const image = screen.getByRole("presentation");
    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("fetchpriority", "high");
    expect(screen.getByText("Price")).toHaveClass("sr-only");
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("marks API text as English when the locale is Portuguese", () => {
    renderWithProviders(
      <ul>
        <ProductCard product={{ ...product, inStock: true }} />
      </ul>,
      { locale: "pt" },
    );
    expect(screen.getByRole("link", { name: "Essence Mascara" })).toHaveAttribute("lang", "en");
    expect(screen.queryByText("Esgotado")).not.toBeInTheDocument();
  });
});
