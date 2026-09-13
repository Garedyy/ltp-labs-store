import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { OrderLines } from "./order-lines";

const line = {
  productId: 1,
  title: "Essence Mascara Lash Princess",
  thumbnail: "https://cdn.example/1.png",
  quantity: 2,
  maxQuantity: 5,
  unitPriceFormatted: "$9.99",
  linePriceFormatted: "$19.98",
  href: "/pt/products/1",
};

describe("OrderLines", () => {
  it("lists the lines with quantity and line price, API text tagged as English", () => {
    renderWithProviders(<OrderLines lines={[line]} />, { locale: "pt" });
    const list = screen.getByRole("list", { name: "Artigos" });
    expect(list).toHaveTextContent("Qtd. 2");
    expect(list).toHaveTextContent("$19.98");
    expect(screen.getByText("Essence Mascara Lash Princess")).toHaveAttribute("lang", "en");
    expect(screen.getByRole("presentation")).toHaveAttribute("src", line.thumbnail);
  });
});
