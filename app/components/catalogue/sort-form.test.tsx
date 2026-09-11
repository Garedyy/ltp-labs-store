import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { SortForm } from "./sort-form";

describe("SortForm", () => {
  it("is a GET form with a labelled select, the five sorts and a visible Apply button", () => {
    renderWithProviders(<SortForm query={{ page: 1, q: "", category: "beauty" }} />);
    const select = screen.getByRole("combobox", { name: "Sort by" });
    expect(select.closest("form")).toHaveAttribute("method", "get");
    expect(screen.getAllByRole("option")).toHaveLength(6);
    expect(select).toHaveValue("");
    expect(screen.getByRole("button", { name: "Apply" })).toHaveAttribute("type", "submit");
    expect(document.querySelector('input[name="category"]')).toHaveValue("beauty");
  });

  it("preselects the current sort", () => {
    renderWithProviders(<SortForm query={{ page: 1, q: "", sort: "rating-desc" }} />);
    expect(screen.getByRole("combobox", { name: "Sort by" })).toHaveValue("rating-desc");
  });
});
