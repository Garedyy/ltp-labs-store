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
