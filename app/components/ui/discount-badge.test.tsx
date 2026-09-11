import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DiscountBadge } from "./discount-badge";

describe("DiscountBadge", () => {
  it("is decorative and never uses orange as text", () => {
    render(<DiscountBadge percentFormatted="-15%" />);
    const badge = screen.getByText("-15%");
    expect(badge).toHaveAttribute("aria-hidden", "true");
    expect(badge).toHaveClass("bg-accent", "text-accent-fg");
  });
});
