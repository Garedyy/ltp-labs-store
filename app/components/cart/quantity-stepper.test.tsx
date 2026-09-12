import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSyncExternalStore } from "react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { createTestStore, type TestStore } from "../../../tests/helpers/store";
import type { CartActionResult } from "./cart-types";
import { QuantityStepper } from "./quantity-stepper";

// The store stands in for the cart loader: the action writes the accepted quantity into it.
function Harness({ store }: { store: TestStore<number> }) {
  const quantity = useSyncExternalStore(store.subscribe, store.get);
  return (
    <>
      <span id="line-title-16">Apple</span>
      <QuantityStepper productId={16} title="Apple" quantity={quantity} maxQuantity={8} />
    </>
  );
}

// Mirrors the cart action: an integer updates, anything else is refused.
function renderStepper() {
  const store = createTestStore(2);
  renderWithProviders(<Harness store={store} />, {
    path: "/en/cart",
    action: async ({ request }): Promise<CartActionResult> => {
      const form = await request.formData();
      const raw = String(form.get("setQuantity") ?? form.get("quantity") ?? "");
      if (!/^\d+$/.test(raw)) return { ok: false, error: "invalid-quantity", productId: 16 };
      store.set(Number(raw));
      return { ok: true, notice: "quantity-updated", values: { title: "Apple", quantity: raw } };
    },
  });
  return screen.getByRole("textbox", { name: "Qty Apple" });
}

describe("QuantityStepper", () => {
  it("keeps focus on the input when Enter submits a new value", async () => {
    const user = userEvent.setup();
    const input = renderStepper();
    await user.click(input);
    await user.clear(input);
    await user.type(input, "5{Enter}");
    await waitFor(() => expect(screen.getByRole("button", { name: /Increase/ })).toHaveValue("6"));
    expect(input).toHaveValue("5");
    expect(document.activeElement).toBe(input);
  });

  it("keeps an invalid value, flags the input and focuses it", async () => {
    const user = userEvent.setup();
    const input = renderStepper();
    await user.click(input);
    await user.clear(input);
    await user.type(input, "abc{Enter}");
    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    expect(input).toHaveValue("abc");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a whole number");
    expect(document.activeElement).toBe(input);
  });
});
