import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { ThemeSwitcher } from "./theme-switcher";

describe("ThemeSwitcher", () => {
  it("names the summary with the current theme and posts the other two", () => {
    renderWithProviders(<ThemeSwitcher />, { path: "/en/cart?x=1", theme: "dark" });
    expect(screen.getByText("Theme: Dark. Change theme")).toHaveClass("sr-only");
    expect(screen.getByText("Dark")).toHaveAttribute("aria-current", "true");
    const light = screen.getByRole("button", { name: "Light" });
    expect(light).toHaveAttribute("name", "theme");
    expect(light).toHaveAttribute("value", "light");
    expect(screen.getByRole("button", { name: "System" })).toHaveAttribute("value", "system");
    expect(light.closest("form")).toHaveAttribute("action", "/en/set-theme");
    expect(screen.getByDisplayValue("/en/cart?x=1")).toHaveAttribute("name", "redirectTo");
  });

  it("defaults to the system theme and translates the labels", () => {
    renderWithProviders(<ThemeSwitcher />, { locale: "pt" });
    expect(screen.getByText("Tema: Sistema. Mudar de tema")).toBeInTheDocument();
    expect(screen.getByText("Sistema")).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Claro" })).toHaveAttribute("value", "light");
    expect(screen.getByRole("button", { name: "Escuro" })).toHaveAttribute("value", "dark");
  });
});
