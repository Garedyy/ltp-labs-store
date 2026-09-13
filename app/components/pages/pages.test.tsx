import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../tests/helpers/render";
import { AboutPage } from "./about-page";
import { AccountPage } from "./account-page";
import { BlogPage } from "./blog-page";
import { ContactPage } from "./contact-page";

describe("AboutPage", () => {
  it("has one h1 and three named sections, with the fictional team", () => {
    renderWithProviders(<AboutPage title="About us" />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("region").map((r) => r.getAttribute("aria-labelledby"))).toEqual([
      "story-heading",
      "values-heading",
      "team-heading",
    ]);
    expect(screen.getByText("Inês Tavares")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });
});

describe("BlogPage", () => {
  it("renders one labelled article per post with a machine-readable date", () => {
    renderWithProviders(
      <BlogPage
        title="Blog"
        posts={[{ key: "packaging", date: "2026-08-20", dateFormatted: "Aug 20, 2026" }]}
      />,
    );
    const article = screen.getByRole("article", {
      name: "Why we switched to plastic-free packaging",
    });
    expect(within(article).getByText("Aug 20, 2026")).toHaveAttribute("datetime", "2026-08-20");
  });
});

describe("ContactPage", () => {
  it("renders the details and the named form", () => {
    renderWithProviders(<ContactPage title="Contact" sent={false} />);
    expect(screen.getByRole("link", { name: "hello@theonlinestore.example" })).toHaveAttribute(
      "href",
      "mailto:hello@theonlinestore.example",
    );
    expect(screen.getByRole("form", { name: "Send us a message" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send message" })).toHaveAttribute("type", "submit");
  });

  it("replaces the form with a focused status once sent", () => {
    renderWithProviders(<ContactPage title="Contact" sent />, { path: "/en/contact?sent=1" });
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveFocus();
    expect(screen.getByRole("link", { name: "Send another message" })).toHaveAttribute(
      "href",
      "/en/contact",
    );
  });
});

describe("AccountPage", () => {
  const view = { cartCount: 0, sinceFormatted: "Jan 15, 2026", languageName: "English" };

  it("shows the device's session without an order", () => {
    renderWithProviders(<AccountPage title="Account" view={view} demo={false} />);
    expect(screen.getByRole("form", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByText("No order yet")).toBeInTheDocument();
    expect(screen.getByText("Empty")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("links the last order and shows the demo notice", () => {
    const lastOrder = {
      number: "LTP-ABC",
      method: "card" as const,
      totalCents: 2999,
      itemCount: 1,
      totalFormatted: "$29.99",
    };
    renderWithProviders(<AccountPage title="Account" view={{ ...view, lastOrder }} demo />);
    expect(screen.getByText("LTP-ABC, $29.99")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View the confirmation" })).toHaveAttribute(
      "href",
      "/en/checkout/confirmation",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Sign-in is a demo");
  });
});
