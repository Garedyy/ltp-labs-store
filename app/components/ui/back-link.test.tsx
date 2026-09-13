import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithRouter } from "../../../tests/helpers/render";
import { BackLink } from "./back-link";

describe("BackLink", () => {
  it("is a plain link to a fixed destination with a decorative chevron", () => {
    renderWithRouter(<BackLink to="/en/shop">Back to the shop</BackLink>);
    const link = screen.getByRole("link", { name: "Back to the shop" });
    expect(link).toHaveAttribute("href", "/en/shop");
    expect(link).toHaveClass("min-h-11");
    const icon = link.querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).toHaveClass("rtl:-scale-x-100");
  });
});
