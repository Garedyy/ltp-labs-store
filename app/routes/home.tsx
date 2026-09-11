import type { Route } from "./+types/home";

// Placeholder until feature/i18n-foundation replaces this route with the localised catalogue.
const BRAND = "The Online Store";

export function meta(_: Route.MetaArgs) {
  return [{ title: BRAND }];
}

export default function Home() {
  return (
    <main className="mx-auto max-w-prose p-4">
      <h1>{BRAND}</h1>
    </main>
  );
}
