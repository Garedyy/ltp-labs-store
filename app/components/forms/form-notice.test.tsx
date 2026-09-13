import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormNotice } from "./form-notice";

describe("FormNotice", () => {
  it("is a status region that takes the focus when it mounts", () => {
    render(<FormNotice>Message received</FormNotice>);
    const notice = screen.getByRole("status");
    expect(notice).toHaveTextContent("Message received");
    expect(notice).toHaveFocus();
  });
});
