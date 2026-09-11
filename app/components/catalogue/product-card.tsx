import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { useLocale } from "~/i18n/use-locale";
import type { ProductCardView } from "~/lib/catalogue/types";

type ProductCardProps = { product: ProductCardView; priority?: "high" | "eager" | "lazy" };

// The title link is stretched over the whole card; the image is decorative (alt="").
export function ProductCard({ product, priority = "lazy" }: ProductCardProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const lang = locale === "en" ? undefined : "en";

  return (
    <li>
      <article className="relative flex h-full flex-col gap-3 rounded-2xl border border-border p-3 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus forced-colors:border">
        <div className="aspect-square overflow-hidden rounded-xl bg-surface-placeholder">
          <img
            src={product.thumbnail}
            alt=""
            width={400}
            height={400}
            loading={priority === "lazy" ? "lazy" : "eager"}
            decoding={priority === "lazy" ? "async" : undefined}
            fetchPriority={priority === "high" ? "high" : undefined}
            className="size-full object-contain"
          />
        </div>
        <h2 className="text-body font-medium">
          <Link
            to={product.href}
            prefetch="intent"
            lang={lang}
            className="no-underline after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none"
          >
            {product.title}
          </Link>
        </h2>
        <p className="mt-auto">
          <VisuallyHidden>{t("catalogue.card.price")}</VisuallyHidden> {product.priceFormatted}
        </p>
        {!product.inStock && (
          <p className="text-body-sm text-fg-muted">{t("catalogue.card.outOfStock")}</p>
        )}
      </article>
    </li>
  );
}
