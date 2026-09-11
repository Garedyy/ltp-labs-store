import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("marks Home as current on the catalogue but not Shop, and names every control", () => {
    renderWithProviders(<SiteHeader cartCount={0} />);
    const [mainNav] = screen.getAllByRole("navigation", { name: "Main" });
    const home = within(mainNav!).getByRole("link", { name: "Home" });
    expect(home).toHaveAttribute("aria-current", "page");
    expect(within(mainNav!).getByRole("link", { name: "Shop" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getAllByRole("link", { name: "Search" })[0]).toHaveAttribute(
      "href",
      "/en/search",
    );
    expect(screen.getByRole("link", { name: "Cart, empty" })).toHaveAttribute("href", "/en/cart");
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("puts the item count in the cart link name", () => {
    renderWithProviders(<SiteHeader cartCount={3} />);
    expect(screen.getByRole("link", { name: "Cart, 3 items" })).toHaveTextContent("3");
  });

  it("caps the visible badge at 99+", () => {
    renderWithProviders(<SiteHeader cartCount={120} />);
    expect(screen.getByRole("link", { name: "Cart, 120 items" })).toHaveTextContent("99+");
  });

  it("translates the shell in Portuguese", () => {
    renderWithProviders(<SiteHeader cartCount={1} />, { locale: "pt" });
    expect(screen.getByRole("link", { name: "Carrinho, 1 artigo" })).toBeInTheDocument();
    expect(screen.getAllByRole("navigation", { name: "Principal" }).length).toBeGreaterThan(0);
  });
});
