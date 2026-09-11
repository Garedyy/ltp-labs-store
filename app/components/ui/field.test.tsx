import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field } from "./field";

describe("Field", () => {
  it("links label, hint and error to the control", () => {
    render(
      <Field
        name="promo"
        label="Promo code"
        hint="Try LTP10"
        error="Unknown code"
        errorPrefix="Error:"
      >
        {(ids) => (
          <input
            id={ids.inputId}
            aria-describedby={ids.describedBy}
            aria-invalid="true"
            name="promo"
          />
        )}
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Promo code" });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Error: Unknown code Try LTP10");
    expect(screen.getByRole("alert")).toHaveTextContent("Error: Unknown code");
  });

  it("omits aria-describedby when there is nothing to describe", () => {
    render(
      <Field name="q" label="Search" hideLabel errorPrefix="Error:">
        {(ids) => <input id={ids.inputId} aria-describedby={ids.describedBy} name="q" />}
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Search" });
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(screen.getByText("Search")).toHaveClass("sr-only");
  });
});
