import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VisuallyHidden } from "./visually-hidden";

describe("VisuallyHidden", () => {
  it("keeps the text in the accessibility tree", () => {
    render(
      <button>
        <VisuallyHidden>Close menu</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });

  it("renders the requested element", () => {
    render(<VisuallyHidden as="h2">Categories</VisuallyHidden>);
    expect(screen.getByRole("heading", { level: 2, name: "Categories" })).toHaveClass("sr-only");
  });
});
