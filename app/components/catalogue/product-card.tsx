import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { VisuallyHidden } from "~/components/ui/visually-hidden";
import { useLocale } from "~/i18n/use-locale";
import { revealOnFocus } from "~/lib/reveal-on-focus";
import type { ProductCardView } from "~/lib/catalogue/types";

type ProductCardProps = {
  product: ProductCardView;
  priority?: "high" | "eager" | "lazy";
  // Set by a staggered grid (the landing page): the card enters after this delay. A card focused
  // before its turn loses the delay (the running animation is not restarted), so the focus ring
  // is never on an invisible card; `data-entered`, set by the page, keeps it revealed after blur.
  enterDelayMs?: number;
};

// The title link is stretched over the whole card; the image is decorative (alt="").
export function ProductCard({ product, priority = "lazy", enterDelayMs }: ProductCardProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const lang = locale === "en" ? undefined : "en";

  return (
    <li
      className={
        enterDelayMs === undefined
          ? undefined
          : "focus-within:[animation-delay:0s] data-entered:[animation-delay:0s] motion-safe:animate-card-enter motion-safe:[animation-delay:var(--enter-delay)]"
      }
      style={
        enterDelayMs === undefined
          ? undefined
          : ({ "--enter-delay": `${enterDelayMs}ms` } as CSSProperties)
      }
      data-delayed={enterDelayMs === undefined ? undefined : ""}
    >
      <article className="group relative flex h-full flex-col gap-3 rounded-2xl border border-border p-3 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus hover:border-border-strong motion-safe:transition-colors motion-safe:duration-200 forced-colors:border">
        <div className="aspect-square overflow-hidden rounded-xl bg-surface-placeholder">
          <img
            src={product.thumbnail}
            alt=""
            width={400}
            height={400}
            loading={priority === "lazy" ? "lazy" : "eager"}
            decoding={priority === "lazy" ? "async" : undefined}
            fetchPriority={priority === "high" ? "high" : undefined}
            className="size-full object-contain group-hover:scale-[1.04] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[ease]"
          />
        </div>
        <h2 className="text-body font-medium">
          <Link
            to={product.href}
            prefetch="intent"
            lang={lang}
            className="no-underline after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none"
            onFocus={enterDelayMs === undefined ? undefined : revealOnFocus}
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
