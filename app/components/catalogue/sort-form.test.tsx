import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { SortForm } from "./sort-form";

function Search() {
  return <output data-testid="search">{useLocation().search}</output>;
}

describe("SortForm", () => {
  it("is a GET form with a labelled, described select, the five sorts and an Apply submit", () => {
    renderWithProviders(<SortForm query={{ page: 1, q: "", category: "beauty" }} />);
    const select = screen.getByRole("combobox", { name: "Sort by" });
    expect(select.closest("form")).toHaveAttribute("method", "get");
    expect(select).toHaveAccessibleDescription("Results update when you choose");
    expect(screen.getAllByRole("option")).toHaveLength(6);
    expect(select).toHaveValue("");
    expect(screen.getByRole("button", { name: "Apply" })).toHaveAttribute("type", "submit");
    expect(document.querySelector('input[name="category"]')).toHaveValue("beauty");
  });

  it("preselects the current sort", () => {
    renderWithProviders(<SortForm query={{ page: 1, q: "", sort: "rating-desc" }} />);
    expect(screen.getByRole("combobox", { name: "Sort by" })).toHaveValue("rating-desc");
  });

  it("navigates as soon as a sort is chosen and keeps the focus on the select", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <SortForm query={{ page: 2, q: "" }} />
        <Search />
      </>,
      { path: "/en?page=2" },
    );
    const select = screen.getByRole("combobox", { name: "Sort by" });
    await user.selectOptions(select, "price-desc");
    expect(screen.getByTestId("search")).toHaveTextContent("?sort=price-desc");
    expect(select).toHaveValue("price-desc");
    expect(select).toHaveFocus();
  });

  it("keeps the query and drops the page and the sort when the default order is chosen", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <SortForm query={{ page: 3, q: "phone", sort: "price-asc" }} />
        <Search />
      </>,
      { path: "/en/search?q=phone&sort=price-asc&page=3" },
    );
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort by" }), "");
    expect(screen.getByTestId("search")).toHaveTextContent(/^\?q=phone$/);
  });
});
