import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { CheckoutForm } from "./checkout-form";

describe("CheckoutForm", () => {
  it("names the form, preselects the method and folds the card fields away for PayPal", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <h1 id="payment-heading">Payment</h1>
        <CheckoutForm totalFormatted="$29.99" initialMethod="card" />
      </>,
    );
    expect(screen.getByRole("form", { name: "Payment" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Card" })).toBeChecked();
    expect(screen.getByRole("textbox", { name: "Card number" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Pay $29.99" })).toHaveAttribute("type", "submit");
    await user.click(screen.getByRole("radio", { name: "PayPal" }));
    expect(screen.getByRole("radio", { name: "PayPal" })).toBeChecked();
    expect(screen.queryByRole("textbox", { name: "Card number" })).not.toBeInTheDocument();
    expect(screen.getByText(/A real store would send you to PayPal/)).toBeVisible();
  });

  it("carries the product of a Buy now as a hidden field", () => {
    const { container } = renderWithProviders(
      <CheckoutForm totalFormatted="$29.99" initialMethod="card" productId={16} />,
    );
    expect(container.querySelector('input[name="product"]')).toHaveValue("16");
  });

  it("renders the refusal: codes under the fields, values kept, focus on the first invalid one", () => {
    renderWithProviders(
      <CheckoutForm
        totalFormatted="$29.99"
        initialMethod="card"
        result={{
          ok: false,
          method: "paypal",
          errors: { email: "email-invalid", city: "field-required" },
          values: {
            email: "nope",
            name: "Ana",
            address: "",
            postalCode: "",
            city: "",
            country: "es",
            cardName: "",
            cardNumber: "",
            cardExpiry: "",
            cardCode: "",
          },
        }}
      />,
    );
    const email = screen.getByRole("textbox", { name: "Email address" });
    expect(email).toHaveFocus();
    expect(email).toHaveValue("nope");
    expect(email).toHaveAccessibleDescription("Error: Enter a valid email address");
    expect(screen.getByRole("textbox", { name: "City" })).toHaveAccessibleDescription(
      "Error: This field is required",
    );
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveValue("Ana");
    expect(screen.getByRole("combobox", { name: "Country" })).toHaveValue("es");
    // The refused method wins over the URL's preselection.
    expect(screen.getByRole("radio", { name: "PayPal" })).toBeChecked();
  });
});
