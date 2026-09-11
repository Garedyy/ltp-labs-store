import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AnnouncerProvider, useAnnounce } from "./announcer";

function Trigger() {
  const announce = useAnnounce();
  return <button onClick={() => announce("Added to your cart")}>Announce</button>;
}

describe("AnnouncerProvider", () => {
  it("renders two polite status regions and alternates between them", async () => {
    render(
      <AnnouncerProvider>
        <Trigger />
      </AnnouncerProvider>,
    );
    const regions = screen.getAllByRole("status");
    expect(regions).toHaveLength(2);
    for (const region of regions) expect(region).toHaveAttribute("aria-live", "polite");

    await userEvent.click(screen.getByRole("button", { name: "Announce" }));
    expect(regions[1]).toHaveTextContent("Added to your cart");
    expect(regions[0]).toBeEmptyDOMElement();

    await userEvent.click(screen.getByRole("button", { name: "Announce" }));
    expect(regions[0]).toHaveTextContent("Added to your cart");
    expect(regions[1]).toBeEmptyDOMElement();
  });
});
