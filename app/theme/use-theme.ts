import { useRouteLoaderData } from "react-router";

import { DEFAULT_THEME, isTheme, type Theme } from "./config";

export function useTheme(): Theme {
  const rootData = useRouteLoaderData("root") as { theme?: unknown } | undefined;
  return isTheme(rootData?.theme) ? rootData.theme : DEFAULT_THEME;
}
