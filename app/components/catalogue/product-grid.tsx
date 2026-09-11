import { useNavigationPending } from "~/components/layout/navigation-status";
import { cx } from "~/lib/cx";
import type { ProductCardView } from "~/lib/catalogue/types";
import { ProductCard } from "./product-card";

const EAGER_COUNT = 3;

function priorityFor(index: number): "high" | "eager" | "lazy" {
  if (index === 0) return "high";
  return index < EAGER_COUNT ? "eager" : "lazy";
}

export function ProductGrid({ products }: { products: ProductCardView[] }) {
  const pending = useNavigationPending();
  return (
    <ul
      aria-labelledby="results-heading"
      aria-busy={pending || undefined}
      className={cx(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        pending && "motion-safe:opacity-60 motion-safe:transition-opacity",
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={priorityFor(index)} />
      ))}
    </ul>
  );
}
