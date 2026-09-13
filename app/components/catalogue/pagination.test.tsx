import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("renders a named nav, the current page and prev/next only when applicable", () => {
    renderWithProviders(<Pagination page={1} pageCount={22} />, { path: "/en" });
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute("href", "/en?page=2");
    expect(screen.queryByRole("link", { name: "Previous page" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute("rel", "next");
    expect(screen.getAllByRole("link")).toHaveLength(6);
  });

  it("keeps the other params and links page 1 without the param", () => {
    renderWithProviders(<Pagination page={3} pageCount={5} />, {
      path: "/en?category=beauty&sort=price-asc&page=3",
    });
    expect(screen.getByRole("link", { name: "Page 1" })).toHaveAttribute(
      "href",
      "/en?category=beauty&sort=price-asc",
    );
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/en?category=beauty&sort=price-asc&page=2",
    );
  });

  it("gives hover feedback to every link except the current page", () => {
    renderWithProviders(<Pagination page={2} pageCount={5} />, { path: "/en?page=2" });
    const current = screen.getByRole("link", { name: "Page 2" });
    expect(current).toHaveClass("bg-primary", "text-primary-fg");
    expect(current.className).not.toMatch(/hover:/);
    expect(screen.getByRole("link", { name: "Page 3" })).toHaveClass("hover:bg-surface-muted");
    expect(screen.getByRole("link", { name: "Next page" })).toHaveClass("hover:bg-surface-muted");
  });

  it("renders nothing for a single page", () => {
    renderWithProviders(<Pagination page={1} pageCount={1} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
