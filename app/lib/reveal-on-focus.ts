import type { FocusEvent } from "react";

// A delayed entrance (landing page) loses its delay through CSS while the control has the focus;
// this additive handler, on the control itself, keeps the reveal once the focus leaves.
export function revealOnFocus(event: FocusEvent<HTMLElement>) {
  event.currentTarget.closest("[data-delayed]")?.setAttribute("data-entered", "");
}
