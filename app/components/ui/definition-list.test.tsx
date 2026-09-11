import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DefinitionList } from "./definition-list";

describe("DefinitionList", () => {
  it("renders terms and definitions with an optional language of parts", () => {
    render(
      <DefinitionList
        items={[
          { key: "brand", term: "Brand", description: "Essence", lang: "en" },
          { key: "sku", term: "SKU", description: "BEA-ESS-001" },
        ]}
      />,
    );
    expect(screen.getAllByRole("term")).toHaveLength(2);
    expect(screen.getAllByRole("definition")).toHaveLength(2);
    expect(screen.getByText("Essence")).toHaveAttribute("lang", "en");
    expect(screen.getByText("BEA-ESS-001")).not.toHaveAttribute("lang");
  });
});
