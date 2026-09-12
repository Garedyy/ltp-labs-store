import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSyncExternalStore } from "react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { createTestStore, type TestStore } from "../../../tests/helpers/store";
import type { CartActionResult } from "./cart-types";
import { PromoCodeForm } from "./promo-code-form";

// The store stands in for the cart loader: the action writes the applied code into it.
function Harness({ store }: { store: TestStore<string | undefined> }) {
  const promoCode = useSyncExternalStore(store.subscribe, store.get);
  return <PromoCodeForm promoCode={promoCode} />;
}

// Mirrors the cart action: LTP10 is the only accepted code.
function renderForm() {
  const store = createTestStore<string | undefined>(undefined);
  renderWithProviders(<Harness store={store} />, {
    path: "/en/cart",
    action: async ({ request }): Promise<CartActionResult> => {
      const form = await request.formData();
      if (form.get("intent") === "remove-promo") {
        store.set(undefined);
        return { ok: true, notice: "promo-removed" };
      }
      if (String(form.get("code")).toUpperCase() !== "LTP10") {
        return { ok: false, error: "promo-invalid" };
      }
      store.set("LTP10");
      return { ok: true, notice: "promo-applied", values: { code: "LTP10" } };
    },
  });
}

describe("PromoCodeForm", () => {
  it("moves focus to Remove code once applied, and back to the input once removed", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByRole("textbox", { name: "Promo code" }), "ltp10");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    const remove = await screen.findByRole("button", { name: "Remove code" });
    await waitFor(() => expect(document.activeElement).toBe(remove));
    await user.click(remove);
    const input = await screen.findByRole("textbox", { name: "Promo code" });
    await waitFor(() => expect(document.activeElement).toBe(input));
  });

  it("focuses the input on a refused code", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByRole("textbox", { name: "Promo code" }), "nope");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Unknown promo code");
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Promo code" }));
  });
});
