import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [{ title: "The Online Store" }];
}

export default function Home() {
  return (
    <main className="mx-auto max-w-prose p-4">
      <h1>The Online Store</h1>
    </main>
  );
}
