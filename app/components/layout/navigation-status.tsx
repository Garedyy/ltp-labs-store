import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "react-router";

import { useAnnounce } from "./announcer";

const DELAY_MS = 300;

// A 2 px bar under the header, revealed by a CSS delay so fast navigations never flicker;
// announced once after the same delay.
export function NavigationStatus() {
  const { t } = useTranslation();
  const announce = useAnnounce();
  const pending = useNavigationPending();

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => announce(t("common.loading")), DELAY_MS);
    return () => clearTimeout(timer);
  }, [pending, announce, t]);

  return (
    <div
      aria-hidden="true"
      className={`mx-auto mt-1 h-0.5 max-w-[87rem] rounded-full bg-accent motion-safe:transition-[opacity,transform] motion-safe:duration-150 motion-safe:ease-out ${
        pending ? "translate-y-0 opacity-100 delay-300" : "-translate-y-1 opacity-0 delay-0"
      }`}
    />
  );
}

export function useNavigationPending(): boolean {
  return useNavigation().state !== "idle";
}
