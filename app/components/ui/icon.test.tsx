import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "./icon";

describe("Icon", () => {
  it("is hidden from assistive technology and inherits the text colour", () => {
    const { container } = render(<Icon name="search" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg?.querySelector("path")?.getAttribute("d")).toMatch(/^M/);
  });
});
