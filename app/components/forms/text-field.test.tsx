import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { TextField } from "./text-field";

describe("TextField", () => {
  it("renders a labelled input with the translated error code and the typed value", () => {
    renderWithProviders(
      <TextField name="email" label="Email address" error="email-invalid" defaultValue="nope" />,
    );
    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input).toBeInvalid();
    expect(input).toHaveValue("nope");
    expect(input).toHaveAccessibleDescription("Error: Enter a valid email address");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email address");
  });

  it("renders a textarea named by its visible label, with autoFocus when asked", () => {
    renderWithProviders(
      // eslint-disable-next-line jsx-a11y/no-autofocus -- the prop under test
      <TextField name="message" label="Message" multiline autoFocus />,
    );
    const textarea = screen.getByRole("textbox", { name: "Message" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveFocus();
    expect(textarea).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
