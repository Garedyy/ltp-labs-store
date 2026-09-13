import { useNavigationPending } from "~/components/layout/navigation-status";
import { cx } from "~/lib/cx";
import type { ProductCardView } from "~/lib/catalogue/types";
import { ProductCard } from "./product-card";

const EAGER_COUNT = 3;
const STAGGER_MS = 80;

function priorityFor(index: number): "high" | "eager" | "lazy" {
  if (index === 0) return "high";
  return index < EAGER_COUNT ? "eager" : "lazy";
}

export function ProductGrid({
  products,
  labelledBy = "results-heading",
  stagger = false,
}: {
  products: ProductCardView[];
  labelledBy?: string;
  // Landing page: the cards cascade in, one every STAGGER_MS.
  stagger?: boolean;
}) {
  const pending = useNavigationPending();
  return (
    <ul
      aria-labelledby={labelledBy}
      aria-busy={pending || undefined}
      className={cx(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        pending && "motion-safe:opacity-60 motion-safe:transition-opacity",
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={priorityFor(index)}
          enterDelayMs={stagger ? index * STAGGER_MS : undefined}
        />
      ))}
    </ul>
  );
}
