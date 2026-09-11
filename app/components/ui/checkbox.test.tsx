import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("is named by its label and toggles through the label row", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Beauty" name="category" value="beauty" onChange={onChange} />);
    const checkbox = screen.getByRole("checkbox", { name: "Beauty" });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(screen.getByText("Beauty"));
    expect(onChange).toHaveBeenCalledOnce();
  });
});
