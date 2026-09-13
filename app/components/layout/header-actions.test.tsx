import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { CartLink } from "./header-actions";

function Harness() {
  const [count, setCount] = useState(1);
  return (
    <>
      <CartLink count={count} />
      <button type="button" onClick={() => setCount(count + 1)}>
        bump
      </button>
    </>
  );
}

describe("CartLink", () => {
  it("remounts the badge when the count changes so its pop-in replays", async () => {
    renderWithProviders(<Harness />);
    const before = screen.getByText("1");
    expect(before).toHaveClass("motion-safe:animate-pop-in");
    await userEvent.click(screen.getByRole("button", { name: "bump" }));
    const after = screen.getByText("2");
    expect(after).not.toBe(before);
    expect(before).not.toBeInTheDocument();
  });
});
