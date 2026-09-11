import { useEffect, useRef } from "react";
import { useLocation, useMatches } from "react-router";

import { useAnnounce } from "./announcer";

type InitialFocusHandle = { initialFocus?: string };

function initialFocusFrom(matches: ReturnType<typeof useMatches>): string | undefined {
  for (const match of [...matches].reverse()) {
    const handle = match.handle as InitialFocusHandle | undefined;
    if (handle?.initialFocus) return handle.initialFocus;
  }
  return undefined;
}

// Pathname changes only: search-param and fetcher announcements are owned by their routes.
export function RouteAnnouncer() {
  const { pathname } = useLocation();
  const matches = useMatches();
  const announce = useAnnounce();
  const previous = useRef(pathname);
  const initialFocus = initialFocusFrom(matches);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;

    for (const details of document.querySelectorAll("details[open]"))
      details.removeAttribute("open");

    const preferred = initialFocus ? document.querySelector<HTMLElement>(initialFocus) : null;
    const target = preferred ?? document.getElementById("main");
    target?.focus({ preventScroll: true });
    announce(document.title);
  }, [pathname, initialFocus, announce]);

  return null;
}
