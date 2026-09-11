import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Disclosure } from "./disclosure";

function renderMenu() {
  return render(
    <div>
      <Disclosure summary="Menu" summaryLabel="Open menu">
        <a href="/en/about">About</a>
      </Disclosure>
      <button>Outside</button>
    </div>,
  );
}

describe("Disclosure", () => {
  it("exposes the summary with its accessible name", () => {
    renderMenu();
    expect(screen.getByText("Menu")).toHaveAttribute("aria-label", "Open menu");
  });

  it("closes on Escape and returns focus to the summary", async () => {
    const user = userEvent.setup();
    renderMenu();
    const summary = screen.getByText("Menu");
    const details = summary.closest("details") as HTMLDetailsElement;
    details.open = true;
    screen.getByRole("link", { name: "About" }).focus();
    await user.keyboard("{Escape}");
    expect(details.open).toBe(false);
    expect(summary).toHaveFocus();
  });

  it("closes on a pointer down outside", async () => {
    const user = userEvent.setup();
    renderMenu();
    const details = screen.getByText("Menu").closest("details") as HTMLDetailsElement;
    details.open = true;
    await user.pointer({
      keys: "[MouseLeft>]",
      target: screen.getByRole("button", { name: "Outside" }),
    });
    expect(details.open).toBe(false);
  });
});
