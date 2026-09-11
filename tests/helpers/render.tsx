import { render, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { createRoutesStub } from "react-router";

// Mounts route-aware components (Link, Form, fetchers) inside a stub router at "/".
export function renderWithRouter(ui: ReactElement): RenderResult {
  const Stub = createRoutesStub([{ path: "/", Component: () => ui }]);
  return render(<Stub initialEntries={["/"]} />);
}
