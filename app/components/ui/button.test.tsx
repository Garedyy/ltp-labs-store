import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithRouter } from "../../../tests/helpers/render";
import { Button, ButtonLink } from "./button";

describe("Button", () => {
  it("renders an accessible button with type=button by default", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Add to cart</Button>);
    const button = screen.getByRole("button", { name: "Add to cart" });
    expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("stays enabled while pending and announces busy with the pending label", () => {
    render(
      <Button type="submit" pending pendingLabel="Adding…">
        Add to cart
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Adding…" });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("supports a real disabled state", () => {
    render(<Button disabled>Add to cart</Button>);
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeDisabled();
  });
});

describe("ButtonLink", () => {
  it("renders a link styled as a button", () => {
    renderWithRouter(<ButtonLink to="/en/cart">View cart</ButtonLink>);
    const link = screen.getByRole("link", { name: "View cart" });
    expect(link).toHaveAttribute("href", "/en/cart");
    expect(link).toHaveClass("bg-primary");
  });
});
