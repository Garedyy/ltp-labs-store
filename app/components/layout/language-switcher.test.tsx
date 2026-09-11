import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { LanguageSwitcher } from "./language-switcher";

describe("LanguageSwitcher", () => {
  it("names the summary with the current language and posts the other one", () => {
    renderWithProviders(<LanguageSwitcher />, { path: "/en/cart?x=1" });
    expect(screen.getByRole("navigation", { name: "Language" })).toBeInTheDocument();
    expect(screen.getByText("EN, English. Change language")).toHaveClass("sr-only");
    const button = screen.getByRole("button", { name: "Português" });
    expect(button).toHaveAttribute("value", "pt");
    expect(button).toHaveAttribute("lang", "pt-PT");
    expect(button.closest("form")).toHaveAttribute("action", "/en/set-language");
    expect(screen.getByDisplayValue("/en/cart?x=1")).toHaveAttribute("name", "redirectTo");
    expect(screen.getByText("English")).toHaveAttribute("aria-current", "true");
  });
});
