import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Price } from "./price";

const labels = { price: "Price", originalPrice: "Original price" };

describe("Price", () => {
  it("names the price for screen readers", () => {
    render(<Price priceFormatted="$19.99" labels={labels} />);
    expect(screen.getByText("Price")).toHaveClass("sr-only");
    expect(screen.getByText("$19.99")).toBeInTheDocument();
    expect(screen.queryByText("Original price")).not.toBeInTheDocument();
  });

  it("strikes the original price visually and names it for screen readers", () => {
    render(<Price priceFormatted="$17.99" originalPriceFormatted="$19.99" labels={labels} />);
    const struck = screen.getByText("$19.99", { selector: "s" });
    expect(struck).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Original price")).toHaveClass("sr-only");
    expect(screen.getByText("$19.99", { selector: ".sr-only" })).toBeInTheDocument();
  });
});
