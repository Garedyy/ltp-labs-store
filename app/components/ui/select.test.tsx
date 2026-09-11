import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Select } from "./select";

const options = [
  { value: "", label: "Sort by" },
  { value: "price-asc", label: "Price: low to high" },
];

describe("Select", () => {
  it("is a combobox named by its label with the given options", () => {
    render(<Select id="sort" name="sort" label="Sort by" hideLabel options={options} />);
    const select = screen.getByRole("combobox", { name: "Sort by" });
    expect(select).toHaveAttribute("name", "sort");
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("option", { name: "Price: low to high" })).toHaveValue("price-asc");
  });
});
