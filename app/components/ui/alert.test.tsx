import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./alert";

describe("Alert", () => {
  it("is an alert region prefixed for screen readers", () => {
    render(<Alert prefix="Error:">Product not found</Alert>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Error: Product not found");
    expect(screen.getByText("Error:")).toHaveClass("sr-only");
  });
});
