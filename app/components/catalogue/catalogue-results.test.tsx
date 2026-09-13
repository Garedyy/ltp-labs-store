import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { AnnouncerProvider } from "~/components/layout/announcer";
import type { CatalogueView } from "~/lib/catalogue/types";
import { renderWithProviders } from "../../../tests/helpers/render";
import { CatalogueResults } from "./catalogue-results";

const RESULTS: CatalogueView = {
  products: [],
  total: 23,
  page: 1,
  pageCount: 3,
  showing: { from: 1, to: 9 },
  query: { page: 1, q: "phone" },
  categories: [],
  title: "Search",
};

// The search route keeps the component mounted across the prompt (null) and results states.
function Harness({ initial }: { initial: CatalogueView | null }) {
  const [view, setView] = useState(initial);
  return (
    <AnnouncerProvider>
      <button onClick={() => setView(RESULTS)}>Show results</button>
      <button onClick={() => setView(null)}>Clear</button>
      <CatalogueResults
        view={view}
        heading="Search"
        announce={{ key: "catalogue.search.announce", values: { q: "phone" } }}
        emptyAnnouncement="Type a word to search the catalogue."
      />
    </AnnouncerProvider>
  );
}

function statusText() {
  return screen
    .getAllByRole("status")
    .map((region) => region.textContent)
    .join("|");
}

describe("CatalogueResults announcements", () => {
  it("announces the first search and the prompt on the way back", async () => {
    renderWithProviders(<Harness initial={null} />, { path: "/en/search" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Search");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(statusText()).toBe("|");

    await userEvent.click(screen.getByRole("button", { name: "Show results" }));
    expect(statusText()).toContain("23 results for “phone”");
    expect(screen.getByRole("combobox", { name: "Sort by" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(statusText()).toContain("Type a word to search the catalogue.");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("stays silent on the initial render with results", () => {
    renderWithProviders(<Harness initial={RESULTS} />, { path: "/en/search?q=phone" });
    expect(screen.getByRole("combobox", { name: "Sort by" })).toBeInTheDocument();
    expect(statusText()).toBe("|");
  });
});

describe("CatalogueResults filters disclosure", () => {
  function renderWithFilters() {
    return renderWithProviders(
      <AnnouncerProvider>
        <CatalogueResults
          view={RESULTS}
          filters={
            <aside id="categories" tabIndex={-1} aria-label="Categories">
              <input type="checkbox" aria-label="Beauty" />
            </aside>
          }
        />
      </AnnouncerProvider>,
      { path: "/en/shop" },
    );
  }

  it("renders no toggle and no jump link without filters", () => {
    renderWithProviders(<Harness initial={RESULTS} />, { path: "/en/search?q=phone" });
    expect(screen.queryByRole("button", { name: "Categories" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Jump to categories" })).not.toBeInTheDocument();
  });

  it("opens the panel, moves the focus into it and closes on Escape back to the button", async () => {
    renderWithFilters();
    const toggle = screen.getByRole("button", { name: "Categories" });
    const panel = document.getElementById("filters-panel");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "filters-panel");
    expect(panel?.className).toContain("max-lg:[.js_&]:hidden");
    expect(screen.getByRole("link", { name: "Jump to categories" })).toHaveAttribute(
      "href",
      "#categories",
    );

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panel?.className).not.toContain("max-lg:[.js_&]:hidden");
    expect(screen.getByRole("complementary", { name: "Categories" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel?.className).toContain("max-lg:[.js_&]:hidden");
    expect(toggle).toHaveFocus();
  });

  it("closes from the button without moving the focus", async () => {
    renderWithFilters();
    const toggle = screen.getByRole("button", { name: "Categories" });
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });
});
