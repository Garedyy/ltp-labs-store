import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Rating } from "./rating";

describe("Rating", () => {
  it("shows the numeric value and a screen-reader label, stars stay decorative", () => {
    const { container } = render(
      <Rating value={4.6} valueFormatted="4.6" label="Rated 4.6 out of 5, 3 reviews" />,
    );
    expect(screen.getByText("Rated 4.6 out of 5, 3 reviews")).toHaveClass("sr-only");
    expect(screen.getByText("4.6")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("svg")).toHaveLength(5);
    expect(container.querySelectorAll("svg.text-accent")).toHaveLength(5);
  });

  it("rounds the filled stars to the nearest integer", () => {
    const { container } = render(<Rating value={3.4} valueFormatted="3.4" label="Rated 3.4" />);
    expect(container.querySelectorAll("svg.text-accent")).toHaveLength(3);
  });
});
